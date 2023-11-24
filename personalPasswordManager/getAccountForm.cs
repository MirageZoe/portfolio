using MongoDataAccess.DataAccess;
using MongoDataAccess.Models;
using System;
using System.Diagnostics;
using System.Windows.Forms;

public struct accountsDataView
{
    public string Platform { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string Url { get; set; }
    public DateTime CreationTime { get; set; }
}

namespace MyPassManager
{
    public partial class getAccountForm : Form
    {
        IDisposable timerRefresh = EasyTimer.SetTimeout(() => { },100);
        public getAccountForm()
        {
            InitializeComponent();
            searchByComboBox.SelectedIndex = 0;
        }

        private void searchByComboBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            string selected = searchByComboBox.GetItemText(searchByComboBox.SelectedItem);
            Debug.WriteLine($"User changed to: {selected}");
            if (selected == "Date...")
            {
                dateTimePicker1.Visible = true;
                dateTimePicker2.Visible = true;
                searchByButton.Visible  = true;
                searchByTextBox.Visible = false;
            } else
            {
                dateTimePicker1.Visible = false;
                dateTimePicker2.Visible = false;
                searchByButton.Visible  = false;
                searchByTextBox.Visible = true;
            }
        }

        private async void searchByTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
            {
                dataGridView1.Rows.Clear();
                Debug.WriteLine($"User searched: {searchByTextBox.Text}");
                AccountDataAccess db = new AccountDataAccess();
                var allAccounts = await db.GetAllAccounts();
                var allPlatforms = await db.GetAllPlatforms();

                if (allAccounts.Count == 0) 
                {
                    infoLabelRecord.Text = "No accounts added yet.";
                    timerRefresh = EasyTimer.SetTimeout(() =>
                    {
                        infoLabelRecord.BeginInvoke((MethodInvoker)delegate () { infoLabelRecord.Text = "".ToString(); });
                    }, 1500);
                    return;
                }
                

                if (searchByComboBox.SelectedIndex == 0)// all
                {
                    foreach (var account in allAccounts)
                    {
                        string platName = allPlatforms.Find(p => p.PlatformId == account.PlatformId).Name;
                        dataGridView1.Rows.Add(account.Id, platName, account.Username, account.Email, account.Password, account.Url, account.CreationDate);
                    }
                }

                if (searchByComboBox.SelectedIndex == 1)//platform...
                {
                    int selectedPlatform = allPlatforms.Find(p => p.Name == FindRightPlatform(searchByTextBox.Text, allPlatforms)).PlatformId;
                    string platName = allPlatforms.Find(p => p.PlatformId == selectedPlatform).Name;
                    Debug.WriteLine("By platform");
                    if (allAccounts.Count == 0) 
                    {
                        MessageBox.Show($"No accounts with the platform '{searchByTextBox.Text}' were found.");
                        return;
                    }
                    foreach (var account in allAccounts)
                        if (account.PlatformId == selectedPlatform) //accountsMeetingCriteria.Add(account);
                            dataGridView1.Rows.Add(account.Id, platName, account.Username, account.Email, account.Password, account.Url, account.CreationDate);
                }

                if (searchByComboBox.SelectedIndex == 2)// username
                {
                    Debug.WriteLine("By username");
                    if (allAccounts.Count == 0)
                    {
                        MessageBox.Show($"No accounts with the username '{searchByTextBox.Text}' were found.");
                        return;
                    }
                    foreach (var account in allAccounts)
                    {
                        string platName = allPlatforms.Find(p => p.PlatformId == account.PlatformId).Name;
                        if (account.Username == FindRightUsername(searchByTextBox.Text, allAccounts)) //accountsMeetingCriteria.Add(account);
                            dataGridView1.Rows.Add(account.Id, platName, account.Username, account.Email, account.Password, account.Url, account.CreationDate);
                    }
                }

                if (searchByComboBox.SelectedIndex == 3)// email
                {
                    Debug.WriteLine("By email");
                    if (allAccounts.Count == 0)
                    {
                        MessageBox.Show($"No accounts with the email '{searchByTextBox.Text}' were found.");
                        return;
                    }
                    foreach (var account in allAccounts)
                    {
                        string platName = allPlatforms.Find(p => p.PlatformId == account.PlatformId).Name;
                        if (account.Email == FindRightEmail(searchByTextBox.Text, allAccounts)) //accountsMeetingCriteria.Add(account);
                            dataGridView1.Rows.Add(account.Id, platName, account.Username, account.Email, account.Password, account.Url, account.CreationDate);
                    }

                }

                if (searchByComboBox.SelectedIndex == 4)// password
                {
                    Debug.WriteLine("By password");
                    if (allAccounts.Count == 0)
                    {
                        MessageBox.Show($"No accounts with the password '{searchByTextBox.Text}' were found.");
                        return;
                    }
                    foreach (var account in allAccounts)
                    {
                        string platName = allPlatforms.Find(p => p.PlatformId == account.PlatformId).Name;
                        if (account.Password == FindRightPassword(searchByTextBox.Text, allAccounts)) //accountsMeetingCriteria.Add(account);
                            dataGridView1.Rows.Add(account.Id, platName, account.Username, account.Email, account.Password, account.Url, account.CreationDate);
                    }

                }

                if (searchByComboBox.SelectedIndex == 5)// url
                {
                    Debug.WriteLine("By url");
                    if (allAccounts.Count == 0)
                    {
                        MessageBox.Show($"No accounts with the url '{searchByTextBox.Text}' were found.");
                        return;
                    }
                    foreach (var account in allAccounts)
                    {
                        string platName = allPlatforms.Find(p => p.PlatformId == account.PlatformId).Name;
                        if (account.Url == FindRightUrl(searchByTextBox.Text, allAccounts)) //accountsMeetingCriteria.Add(account);
                            dataGridView1.Rows.Add(account.Id, platName, account.Username, account.Email, account.Password, account.Url, account.CreationDate);
                    }
                }
            }
        }

        private async void searchByButton_Click(object sender, EventArgs e)
        {
            DateTime firstDate = dateTimePicker1.Value;
            DateTime secondDate = dateTimePicker2.Value;
            AccountDataAccess db = new AccountDataAccess();
            var myAccounts = await db.GetAccountByDate(firstDate, secondDate);
            var myPlatforms = await db.GetAllPlatforms();
            List<accountsDataView> accountsProcessed = new List<accountsDataView>();
            if (myAccounts.Count == 0 )
            {
                MessageBox.Show($"No accounts were found between {firstDate.ToString()} & {secondDate.ToString()}");
                return;
            }
            for (int i = 0; i < myAccounts.Count; i++)
            {
                string platName = myPlatforms.Find(p => p.PlatformId == myAccounts[i].PlatformId).Name;
                Debug.WriteLine(myAccounts[i].Username);
                dataGridView1.Rows.Add(myAccounts[i].Id,platName, myAccounts[i].Username, myAccounts[i].Email, myAccounts[i].Password, myAccounts[i].Url, myAccounts[i].CreationDate);
            }
        }

        private async void dataGridView1_RowHeaderMouseDoubleClick(object sender, DataGridViewCellMouseEventArgs e)
        {
            /*
             * When deleting an account, we first 
             * update the platform database # of accounts
             * update the history of the account added
             * delete account
             */
            var indexRow = dataGridView1.CurrentCell.RowIndex;
            DataGridViewRow selectedRow = dataGridView1.Rows[indexRow];
            Debug.WriteLine(selectedRow.Cells[0].Value+"|"+ 
                selectedRow.Cells[1].Value + "|" + 
                selectedRow.Cells[2].Value + "|" + 
                selectedRow.Cells[3].Value + "|" + 
                selectedRow.Cells[4].Value + "|" +
                selectedRow.Cells[5].Value + "|" +
                selectedRow.Cells[6].Value);
            DialogResult deleteAcc = MessageBox.Show($"Are you sure you want to delete account: {selectedRow.Cells[1].Value}|{selectedRow.Cells[2].Value}","Delete Account?",MessageBoxButtons.YesNo,MessageBoxIcon.Warning);
            if (deleteAcc == DialogResult.Yes)
            {
                AccountDataAccess db = new AccountDataAccess();
                var entireAccHistory = await db.GetAllAccountsHistory();
                var entireAccPlatform = await db.GetAllPlatforms();
                AccountHistoryModel thisHistoryAcc = new AccountHistoryModel();
                PlatformModel thisPlatformMod = new PlatformModel();
                foreach (var accountHis in entireAccHistory)
                {
                    if (accountHis.NewAccountData.Id == selectedRow.Cells[0].Value.ToString())
                    {
                        thisHistoryAcc = accountHis;
                        break;
                    }
                }
                foreach (var platform in entireAccPlatform)
                {
                    if (platform.Name == selectedRow.Cells[1].Value.ToString())
                    {
                        thisPlatformMod = platform;
                        break;
                    }
                }
                thisHistoryAcc.Status = 0;
                thisHistoryAcc.LastChange= DateTime.Now;
                thisPlatformMod.NumberOfAccounts--;
                Task updatePlatformMod = null;
                Debug.WriteLine($"#acc: {thisPlatformMod.NumberOfAccounts}");
                if (thisPlatformMod.NumberOfAccounts == 0)
                    updatePlatformMod = db.DeletePlatform(thisPlatformMod);
                else
                    updatePlatformMod = db.UpdatePlatform(thisPlatformMod);
                Task updateHistoryAcc = db.UpdateAccountHistory(thisHistoryAcc);
                updateHistoryAcc.Wait();
                updatePlatformMod.Wait();
                if (updateHistoryAcc.IsCompleted && updateHistoryAcc.IsCompletedSuccessfully) 
                {

                }

                #region delete Account (also from datagrid)
                Task delAcc = db.DeleteAccountById(selectedRow.Cells[0].Value);
                delAcc.Wait();
                if (delAcc.IsCompleted && delAcc.IsCompletedSuccessfully)
                {
                    MessageBox.Show($"The account '{selectedRow.Cells[1].Value}|{selectedRow.Cells[2].Value}' was successfully deleted!","Account Deleted!",MessageBoxButtons.OK,MessageBoxIcon.Information);
                    
                    // delete from datagridview the row
                    foreach (DataGridViewRow item in dataGridView1.SelectedRows)
                    {
                        dataGridView1.Rows.RemoveAt(item.Index);
                    }
                }
                #endregion
            }
        }

        private void dataGridView1_RowHeaderMouseClick(object sender, DataGridViewCellMouseEventArgs e)
        {
            var indexRow = dataGridView1.CurrentCell.RowIndex;
            DataGridViewRow selectedRow = dataGridView1.Rows[indexRow];
            Clipboard.SetText(selectedRow.Cells[4].Value.ToString());
            infoLabelRecord.Text = "Password was copied successfuly!";
            timerRefresh = EasyTimer.SetTimeout(() =>
            {
                infoLabelRecord.BeginInvoke((MethodInvoker)delegate () { infoLabelRecord.Text = "".ToString(); });

            }, 1500);
            //Debug.WriteLine(selectedRow.Cells[4].Value);
        }

        private string FindRightPlatform(string source, List<PlatformModel> allPlatforms)
        {
            string finalResult = "";
            int currentDistance = 9999;
            
            foreach (var platform in allPlatforms)
            {
                int levenDist = LevenshteinDistance.Compute(source, platform.Name);
                if (levenDist < currentDistance)
                {
                    finalResult = platform.Name;
                    currentDistance = levenDist;
                }
            }

            return finalResult;
        }
        private string FindRightUsername(string source, List<AccountModel> allAccounts)
        {
            string finalResult = "";
            int currentDistance = 9999;

            foreach (var acc in allAccounts)
            {
                int levenDist = LevenshteinDistance.Compute(source, acc.Username);
                if (levenDist < currentDistance)
                {
                    finalResult = acc.Username;
                    currentDistance = levenDist;
                }
            }

            return finalResult;
        }
        private string FindRightEmail(string source, List<AccountModel> allAccounts)
        {
            string finalResult = "";
            int currentDistance = 9999;

            foreach (var acc in allAccounts)
            {
                int levenDist = LevenshteinDistance.Compute(source, acc.Email);
                if (levenDist < currentDistance)
                {
                    finalResult = acc.Email;
                    currentDistance = levenDist;
                }
            }

            return finalResult;
        }
        private string FindRightPassword(string source, List<AccountModel> allAccounts)
        {
            string finalResult = "";
            int currentDistance = 9999;

            foreach (var acc in allAccounts)
            {
                int levenDist = LevenshteinDistance.Compute(source, acc.Password);
                if (levenDist < currentDistance)
                {
                    finalResult = acc.Password;
                    currentDistance = levenDist;
                }
            }

            return finalResult;
        }
        private string FindRightUrl(string source, List<AccountModel> allAccounts)
        {
            string finalResult = "";
            int currentDistance = 9999;

            foreach (var acc in allAccounts)
            {
                int levenDist = LevenshteinDistance.Compute(source, acc.Url);
                if (levenDist < currentDistance)
                {
                    finalResult = acc.Url;
                    currentDistance = levenDist;
                }
            }

            return finalResult;
        }

        private void getAccountForm_Load(object sender, EventArgs e)
        {

        }

        private void getAccountForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            timerRefresh.Dispose();
        }

        private void updateAccButton_Click(object sender, EventArgs e)
        {
            var currentCell = dataGridView1.CurrentCell ?? null;
            if (currentCell == null)
            {
                infoLabelRecord.Text = "Please select an account first!";
                timerRefresh = EasyTimer.SetTimeout(() =>
                {
                    infoLabelRecord.BeginInvoke((MethodInvoker)delegate () { infoLabelRecord.Text = "".ToString(); });

                }, 1500);
                return;
            }
            int indexRow = dataGridView1.CurrentCell.RowIndex;
            var updateAccForm = new updateAccountForm(this);
            DataGridViewRow selectedRow = dataGridView1.Rows[indexRow];//selectedRow.Cells[0].Value
            updateAccForm.tb_platform = selectedRow.Cells[1].Value.ToString();
            updateAccForm.tb_username = selectedRow.Cells[2].Value.ToString();
            updateAccForm.tb_email = selectedRow.Cells[3].Value.ToString();
            updateAccForm.tb_password = selectedRow.Cells[4].Value.ToString();
            updateAccForm.tb_url = selectedRow.Cells[5].Value.ToString();
            updateAccForm.lb_createdAt = selectedRow.Cells[6].Value.ToString();
            //Debug.WriteLine(selectedRow.Cells[0].Value + "|" +
            //    selectedRow.Cells[1].Value.ToString() + "|" +
            //    selectedRow.Cells[2].Value + "|" +
            //    selectedRow.Cells[3].Value + "|" +
            //    selectedRow.Cells[4].Value + "|" +
            //    selectedRow.Cells[5].Value + "|" +
            //    selectedRow.Cells[6].Value);

            updateAccForm.Show();
        }

        public string GetAccountId()
        {
            return dataGridView1.Rows[dataGridView1.CurrentCell.RowIndex].Cells[0].Value.ToString();
        }

    }
}
