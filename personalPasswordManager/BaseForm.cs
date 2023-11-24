using MongoDataAccess.DataAccess;
using MongoDB.Driver;
using System.Diagnostics;
using MongoDataAccess.Models;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace MyPassManager
{

    public partial class BaseForm : Form
    {
        public BaseForm()
        {
            InitializeComponent();
        }
        IDisposable timerRefresh = EasyTimer.SetTimeout(() => { }, 100);
        private static getAccountForm getAccForm = new();
        private saveAccountForm saveAccForm = new();
        private updateAccountForm updateAccForm = new(getAccForm);
        private static int saltLengthLimit = 32;
        private const int totalTimeWindow = 300;
        private int timeLeft = totalTimeWindow;
        private int triesWrong = 0;
        private byte[] IV =
        {
            0x99, 0x89, 0x03, 0x04, 0x79, 0x69, 0x07, 0x08,
            0x59, 0x49, 0x11, 0x12, 0x39, 0x29, 0x19, 0x16,
            0x98, 0x88, 0x05, 0x06, 0x78, 0x68, 0x09, 0x10,
            0x58, 0x48, 0x13, 0x14, 0x38, 0x28, 0x20, 0x21
        };

        private void button1_Click(object sender, EventArgs e)
        {
            if (saveAccForm.IsDisposed)
                saveAccForm = new();
            saveAccForm.Show();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            if (getAccForm.IsDisposed)
                getAccForm = new();
            getAccForm.Show();
        }

        private void BaseForm_Load(object sender, EventArgs e)
        {

        }

        private void textBox1_KeyDown(object sender, KeyEventArgs e)
        {
            string thePass = textBoxPass.Text;
            var myHashedPass = HashString(thePass, "!@ThisIsAVerySecureSaltThatUWillNeverGetIt#2023@!");

            if (e.KeyCode == Keys.Enter)
            {
                string directoryApp = AppContext.BaseDirectory.ToString();
                string fileName = "ld.mpm";
                bool fileDoesntExist = false;
                bool couldReadFine = false;
                bool wroteDownFileBcsNotExisting = false;
                string errorMsg = "";
                try
                {
                    StreamReader sr = new StreamReader(directoryApp + fileName);
#pragma warning disable CS8600 // Converting null literal or possible null value to non-nullable type.
                    string line = sr.ReadLine();
#pragma warning restore CS8600 // Converting null literal or possible null value to non-nullable type.

                    // if we have the file but it's empty, prompt for new password
                    if (line == null || line.Length != 64)
                    {
                        bool refreshedData = false;
                        Debug.WriteLine("MPM: nothing to read or corrupted data, creating new pass");
                        try
                        {
                            StreamWriter sw = new StreamWriter(directoryApp + fileName);
                            sw.WriteLine(myHashedPass);
                            refreshedData = true;
                            sw.Close();
                        }
                        catch (Exception ex2)
                        {
                            Debug.WriteLine("MPM ERROR - Couldn't write the save data bcs: " + ex2.Message);
                            errorMsg = ex2.Message;
                            MessageBox.Show("It seems like my local data was corrupted somehow or other weird thing happened. I tried to refresh it but" +
                                "I failed bcs:\n\n" + errorMsg+"\n\nPossible solutions: Delete ld.mpm file from my directory!", "Failed!", MessageBoxButtons.OK, MessageBoxIcon.Error);

                        }
                        finally
                        {
                            if (refreshedData)
                                MessageBox.Show("It seems like my local data was corrupted somehow or other weird thing happened. I've refreshed the data with" +
                            "\n\n the latest password used.", "Success!", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        }
                    }

                    // if the pass matches, let user use the app

                    if (line == myHashedPass)
                    {
                        button1.Enabled = true;
                        button2.Enabled = true;
                        textBoxPass.Visible = false;
                        timerLabelText.Text = "Available until:";
                        timerLabelNumber.Visible = true;
                        textBoxPass.Text = "";
                        timer.Start();
                    }
                    else
                    {
                        textBoxPass.Text = "";
                        timerLabelText.Text = "Wrong password!";
                        timerRefresh = EasyTimer.SetTimeout(() =>
                        {
                            timerLabelText.BeginInvoke((MethodInvoker)delegate () { timerLabelText.Text = "Insert password to use:".ToString(); });
                        }, 1500);
                        //triesWrong++;
                        //if (triesWrong >= 3)
                        //{
                        //    resetPassLabel.Visible = true;
                        //    toolTipBase.SetToolTip(resetPassLabel,"test 3"); 
                        //}

                    }
                    couldReadFine = true;
                    sr.Close();
                }
                catch (Exception ex)
                {
                    // if file doesn't exist
                    if (ex.Message.Contains("Could not find"))
                    {
                        fileDoesntExist = true;
                        Debug.WriteLine("MPM ERROR: I couldn't find my file to write the data!");
                        // write the hashed password and save the file for next use
                        try
                        {
                            StreamWriter sw = new StreamWriter(directoryApp + fileName);
                            sw.WriteLine(myHashedPass);
                            wroteDownFileBcsNotExisting = true;
                            sw.Close();
                        }
                        catch (Exception ex2)
                        {
                            Debug.WriteLine("MPM ERROR - Couldn't write the save data bcs: " + ex2.Message);
                            errorMsg = ex2.Message;
                        }
                    }
                }
                finally
                {
                    if (fileDoesntExist && wroteDownFileBcsNotExisting)
                    {
                        Debug.WriteLine("My local data wasn't existing but I created a new one successfully!");
                        MessageBox.Show("Because this was the first time use of the program, I've created a local db file to save the password successfully" +
                            "\n\nPlease retry to enter the password!!","Success!",MessageBoxButtons.OK,MessageBoxIcon.Information);
                    }
                    if (fileDoesntExist && !wroteDownFileBcsNotExisting) 
                    {
                        Debug.WriteLine("My local data wasn't existing and tried to create a new one but failed!");
                        MessageBox.Show("Because this was the first time use of the program, I've tried to create a local db file but failed because:\n\n"+errorMsg,"Failed!",MessageBoxButtons.OK,MessageBoxIcon.Error);
                    }
                    if (!fileDoesntExist && couldReadFine) Debug.WriteLine("MPM: I found my local data & could it!");
                }


            }
        }
        private byte[] DeriveKeyFromPassword(string password, byte[] userSalt)
        {
            if (userSalt == Array.Empty<byte>()) ;//Array.Empty<byte>();
                userSalt = Array.Empty<byte>();
            var iterations = 1000;
            var desiredKeyLength = 32; // 16 bytes equal 128 bits., 24 for 192 & 32 for 256
            var hashMethod = HashAlgorithmName.SHA384;
            return Rfc2898DeriveBytes.Pbkdf2(Encoding.Unicode.GetBytes(password),
                                             userSalt,
                                             iterations,
                                             hashMethod,
                                             desiredKeyLength);
        }
        public async Task<byte[]> EncryptAsync(string clearText, string passphrase, byte[] mySalt)
        {
            using Aes aes = Aes.Create();
            aes.Key = DeriveKeyFromPassword(passphrase,mySalt);
            aes.IV = IV;

            using MemoryStream output = new();
            using CryptoStream cryptoStream = new(output, aes.CreateEncryptor(), CryptoStreamMode.Write);

            await cryptoStream.WriteAsync(Encoding.Unicode.GetBytes(clearText));
            await cryptoStream.FlushFinalBlockAsync();

            return output.ToArray();
        }
        public async Task<string> DecryptAsync(byte[] encrypted, string passphrase, byte[] mySalt)
        {
            using Aes aes = Aes.Create();
            aes.Key = DeriveKeyFromPassword(passphrase,mySalt);
            aes.IV = IV;

            using MemoryStream input = new(encrypted);
            using CryptoStream cryptoStream = new(input, aes.CreateDecryptor(), CryptoStreamMode.Read);

            using MemoryStream output = new();
            await cryptoStream.CopyToAsync(output);

            return Encoding.Unicode.GetString(output.ToArray());
        }

        private static byte[] GetSalt()
        {
            return GetSalt(saltLengthLimit);
        }
        private static byte[] GetSalt(int maximumSaltLength)
        {
            var salt = new byte[maximumSaltLength];
            using (var random = RandomNumberGenerator.Create())
            {
                random.GetNonZeroBytes(salt);
            }

            return salt;
        }
        static string HashString(string text, string salt = "")
        {
            if (String.IsNullOrEmpty(text))
            {
                return String.Empty;
            }

            // Uses SHA256 to create the hash
            using (var sha = SHA256.Create())
            {
                // Convert the string to a byte array first, to be processed
                byte[] textBytes = System.Text.Encoding.UTF8.GetBytes(text + salt);
                byte[] hashBytes = sha.ComputeHash(textBytes);

                // Convert back to a string, removing the '-' that BitConverter adds
                string hash = BitConverter
                    .ToString(hashBytes)
                    .Replace("-", String.Empty);

                return hash;
            }
        }

        private void timer_Tick(object sender, EventArgs e)
        {
            if (timeLeft > 0)
            {
                timeLeft--;
                TimeSpan niceTime = TimeSpan.FromSeconds(timeLeft);
                timerLabelNumber.Text = niceTime.ToString(@"mm\:ss");
            } 
            else
            {
                timer.Stop();
                timeLeft = totalTimeWindow;
                button1.Enabled = false;
                button2.Enabled = false;
                textBoxPass.Visible = true;
                timerLabelText.Text = "Insert password to use:";
                timerLabelNumber.Visible = false;
                getAccForm.Hide();
                saveAccForm.Hide();
                if (updateAccForm.IsDisposed)
                {
                    if (getAccForm.IsDisposed)
                        getAccForm = new();
                    updateAccForm = new(getAccForm);
                }
                updateAccForm.Hide();
            }
        }

        private void BaseForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            timerRefresh.Dispose();
        }

    }
}