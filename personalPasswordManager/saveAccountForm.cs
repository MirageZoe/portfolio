using MongoDataAccess.DataAccess;
using MongoDataAccess.Models;
using System.Diagnostics;
using System.Security.Cryptography;

//var test = EasyTimer.SetTimeout;

namespace MyPassManager
{
	
	/**
	
	Summary:
	
	This class is used to gather the following data from the fields:
	
	- platform
	- generated pass (fill it with the password you want or generate a secure one)
	- email 
	- url of the platform
	- username on the platform
	
	After filling the fields, the user will press the "Save Account" button which will send the data to the database.
	The user will be able to receive a confirmation through the "Status" spheres presented below with the color legend:
	
	gray  => Waiting...
	yellow  => no change
	green => Success (created and saved)
	blue => Updated (found and saved)
	red => Fail/Error (failed to find document/Internal Error in application)
	*/
    public partial class saveAccountForm : Form
    {
        IDisposable timerRefresh = EasyTimer.SetTimeout(() => { }, 100);
        public saveAccountForm()
        {
            InitializeComponent();
        }

        public string tb_websiteApp
        {
            get { return textBox_websiteApp.Text; }
            set { textBox_websiteApp.Text = value; }
        }
        public string tb_password
        {
            get { return textBox_passN.Text; }
            set { textBox_passN.Text = value; }
        }
        public string tb_email
        {
            get { return textBox_email.Text; }
            set { textBox_email.Text = value; }
        }
        public string tb_url
        {
            get { return textBox_url.Text; }
            set { textBox_url.Text = value; }
        }
        public string tb_username
        {
            get { return textBox_username.Text; }
            set { textBox_username.Text = value;}
        }

        private void accountsForm_Load(object sender, EventArgs e)
        {

        }

        private void label5_MouseHover(object sender, EventArgs e)
        {
            if (label5.Text == "Username (?):")
                toolTip1.Show("If applicable. Not all accounts require an username!",label5);
        }

        private async void button1_Click(object sender, EventArgs e)
        {
            /*
             * We connect to the database and get all existing platforms.
             * If we have already the platform, we just increment the number of accounts for that platform.
             * Otherwise add the new platform.
             * Lastly, add the new account & post in history
             */
            AccountDataAccess db = new AccountDataAccess();
            PlatformModel myPlatform = new PlatformModel();
            PasswordGenerator PasswordGenerator = new PasswordGenerator();
            var platformResults = await db.GetAllPlatforms();
            bool isExistingCurrentPlatform = false;
            int newestPlatformId = 0;
            bool checksFailed = Checks();
            string passwordGenerated = PasswordGenerator.Generate();

            if (checksFailed == false)
            {
                MessageBox.Show("You need to complete all fields before adding a new account!");
                return;
            }

            if (platformResults.Count > 0)
                foreach (var item in platformResults)
                {
                    if (item.Name == tb_websiteApp.ToLower())
                    {
                        isExistingCurrentPlatform = true;
                        myPlatform = item;
                    } else if (item.PlatformId >= newestPlatformId) 
                        newestPlatformId= item.PlatformId;
                }

            if (isExistingCurrentPlatform)
            {
                myPlatform.NumberOfAccounts++;
                AccountModel newAccount = new AccountModel()
                {
                    PlatformId = myPlatform.PlatformId,
                    Password = tb_password.Length == 0 || tb_password == String.Empty || tb_password == "" ? passwordGenerated : tb_password,
                    Email = tb_email,
                    Url = tb_url,
                    Username = tb_username,
                    CreationDate = DateTime.Now,
                };
                AccountHistoryModel accountHistoryChange = new AccountHistoryModel()
                {
                    OldAccountData = null,
                    NewAccountData = newAccount,
                    Status = 1,
                    LastChange = DateTime.Now
                };
                if (tb_password.Length == 0 || tb_password == String.Empty || tb_password == "")
                    tb_password = passwordGenerated;
                SaveAccData(db, myPlatform, newAccount, accountHistoryChange, true);
            }
            else
            {
                myPlatform.PlatformId = newestPlatformId+1;
                myPlatform.NumberOfAccounts = 1;
                myPlatform.Name = tb_websiteApp;
                if (tb_password.Length == 0 || tb_password == String.Empty || tb_password == "")
                    tb_password = passwordGenerated;

                AccountModel newAccount = new AccountModel()
                {
                    PlatformId = myPlatform.PlatformId,
                    Password = tb_password.Length == 0 || tb_password == String.Empty || tb_password == "" ? passwordGenerated : tb_password,
                    Email = tb_email,
                    Url = tb_url,
                    Username = tb_username,
                    CreationDate = DateTime.Now,
                };
                AccountHistoryModel accountHistoryChange = new AccountHistoryModel()
                {
                    OldAccountData = null,
                    NewAccountData = newAccount,
                    Status = 1,
                    LastChange = DateTime.Now,
                };

                SaveAccData(db, myPlatform, newAccount, accountHistoryChange, false);
            }
        }

        private void SaveAccData(AccountDataAccess db, PlatformModel myPlatform, AccountModel newAccount, AccountHistoryModel accountHistoryChange, bool updatePlatformOnly)
        {
            string oldText = label9.Text;
            if (updatePlatformOnly)
            {
                Task updatePlatformTask = db.UpdatePlatform(myPlatform);
                updatePlatformTask.Wait();
                if (updatePlatformTask.IsCompleted && updatePlatformTask.IsCompletedSuccessfully)
                    status_platform.BackgroundImage = MyPassManager.Properties.Resources.blue_dot;
                else
                    status_platform.BackgroundImage = MyPassManager.Properties.Resources.red_dot;
            } else
            {
                Task createPlatformTask = db.CreatePlatform(myPlatform);
                createPlatformTask.Wait();
                if (createPlatformTask.IsCompleted && createPlatformTask.IsCompletedSuccessfully)
                    status_platform.BackgroundImage = MyPassManager.Properties.Resources.green_dot;
                else
                    status_platform.BackgroundImage = MyPassManager.Properties.Resources.red_dot;
            }

            Task createAccTask = db.CreateAccount(newAccount);
            createAccTask.Wait();
            
            Task createAccHisTask = db.CreateAccountHistory(accountHistoryChange);
            createAccHisTask.Wait();
            
            if (createAccTask.IsCompleted && createAccTask.IsCompletedSuccessfully)
                status_acc_save.BackgroundImage = MyPassManager.Properties.Resources.green_dot;
             else
                status_acc_save.BackgroundImage = MyPassManager.Properties.Resources.red_dot;

            if (createAccHisTask.IsCompleted && createAccHisTask.IsCompletedSuccessfully)
                status_acc_history.BackgroundImage = MyPassManager.Properties.Resources.green_dot;
            else
                status_acc_history.BackgroundImage = MyPassManager.Properties.Resources.red_dot;

            timerRefresh = EasyTimer.SetTimeout(() =>
            {
                status_acc_save.BackgroundImage = MyPassManager.Properties.Resources.grey_dot;
                status_acc_history.BackgroundImage = MyPassManager.Properties.Resources.grey_dot;
                status_platform.BackgroundImage = MyPassManager.Properties.Resources.grey_dot;
                textBox_websiteApp.BeginInvoke((MethodInvoker)delegate () { textBox_websiteApp.Text = "".ToString(); });
                textBox_passN.BeginInvoke((MethodInvoker)delegate () { textBox_passN.Text = "".ToString(); });
                textBox_email.BeginInvoke((MethodInvoker)delegate () { textBox_email.Text = "".ToString(); });
                textBox_url.BeginInvoke((MethodInvoker)delegate () { textBox_url.Text = "".ToString(); });
                textBox_username.BeginInvoke((MethodInvoker)delegate () { textBox_username.Text = "".ToString(); });

            }, 3000);
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

        public bool Checks()
    {
            bool t = true;
            if (tb_websiteApp == "" || tb_email == "" || tb_url == "" || tb_username == "") t = false;
            return t;
    }

        private void accountsForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            timerRefresh.Dispose();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            PasswordGenerator PasswordGenerator = new PasswordGenerator();
            tb_password = PasswordGenerator.Generate();
            Debug.WriteLine("Generated a new password!");
        }
    }
}
