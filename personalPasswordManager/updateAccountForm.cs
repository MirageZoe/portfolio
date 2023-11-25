using MongoDataAccess.DataAccess;
using MongoDataAccess.Models;
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Security.Principal;

namespace MyPassManager
{
	/**
	
	Sumarry:
	
	In this class we will simply update the data of the account selected from the list of accounts found.
	
	After modifying the data, user simply has to press the button and wait for database confirmation that everyhting went successfully.
	It's following the same legend from saveAccountForm class for confirmation.
	*/
	
	
	
    public partial class updateAccountForm : Form
    {
        private IDisposable timerRefresh = EasyTimer.SetTimeout(()=> { },100);
        private getAccountForm getAccountFormInstance { get; set; }

        public updateAccountForm(getAccountForm reference)
        {
            getAccountFormInstance = reference;
            InitializeComponent();
        }

        public string tb_platform
        {
            get { return textBox_platform.Text; }
            set { textBox_platform.Text = value; }
        }
        public string tb_username
        {
            get { return textBox_username.Text; }
            set { textBox_username.Text = value; }
        }
        public string tb_password
        {
            get { return textBox_password.Text; }
            set { textBox_password.Text = value; }
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
        public string lb_createdAt
        {
            get { return label_createdAt.Text; }
            set { label_createdAt.Text = value; }
        }


        private async void updateAccButton_Click(object sender, EventArgs e)
        {
            /*
             * When updating the data of an account, we must update the old and new platform in case 
             * it was changed. If it wasn't changed, we leave it. If it was changed, we change the 
             * old platform with -1 and the new platform either +1 if exist already or create new one.
             */

            AccountDataAccess db = new AccountDataAccess();
            PlatformModel OldPlatform = new PlatformModel();
            var platformResults = await db.GetAllPlatforms();
            Dictionary<string, int> SortedPlatforms = GetAllPlatformsData(platformResults);
            bool isExistingCurrentPlatform = false;
            bool platformWasChanged = false;
            int newestPlatformId = 0;

            // getting old data of the account
            string idAccount = getAccountFormInstance.GetAccountId();
            AccountModel OldAccountData = await db.GetAccountById(idAccount);
            AccountModel NewAccountData = OldAccountData.Clone();
            OldPlatform = GetPlatformTargetFromId(platformResults, OldAccountData.PlatformId);

            // check if the platform was changed. If yes, update old and new one.
            #region Update Platforms Data
            int val = -1;
            SortedPlatforms.TryGetValue(tb_platform.ToLower(), out val);
            if (val != OldPlatform.PlatformId)
                platformWasChanged= true;
            PlatformModel NewPotentialPlatform = OldPlatform.Clone();

            if (platformWasChanged)
                // we search if the platform exist. Otherwise make a new one
                if (platformResults.Count > 0)
                    foreach (var item in platformResults)
                    {
                        if (item.Name == tb_platform.ToLower())
                        {
                            isExistingCurrentPlatform = true;
                            NewPotentialPlatform = item;
                        }
                        else if (item.PlatformId >= newestPlatformId)
                            newestPlatformId = item.PlatformId;
                    }


            if (isExistingCurrentPlatform)
            {
                NewPotentialPlatform.NumberOfAccounts++;
                OldPlatform.NumberOfAccounts--;
                Task updateMyPlat = db.UpdatePlatform(NewPotentialPlatform);
                Task updateMyPlat2 = db.UpdatePlatform(OldPlatform);
                updateMyPlat.Wait();
                updateMyPlat2.Wait();
                if ((updateMyPlat.IsCompleted && updateMyPlat.IsCompletedSuccessfully) && (updateMyPlat2.IsCompleted && updateMyPlat2.IsCompletedSuccessfully)) 
                    status_platform.BackgroundImage = MyPassManager.Properties.Resources.blue_dot;
                else
                    status_platform.BackgroundImage = MyPassManager.Properties.Resources.red_dot;
            }
            else if (platformWasChanged == true)
            {
                NewPotentialPlatform.PlatformId = newestPlatformId + 1;
                NewPotentialPlatform.NumberOfAccounts = 1;
                NewPotentialPlatform.Name = tb_platform.ToLower();
                NewPotentialPlatform.Id = null;
                OldPlatform.NumberOfAccounts--;
                Task updateMyPlat = db.CreatePlatform(NewPotentialPlatform);
                Task updateMyPlat2 = db.UpdatePlatform(OldPlatform);
                updateMyPlat.Wait();
                updateMyPlat2.Wait();
                if ((updateMyPlat.IsCompleted && updateMyPlat.IsCompletedSuccessfully) && (updateMyPlat2.IsCompleted && updateMyPlat2.IsCompletedSuccessfully))
                    status_platform.BackgroundImage = MyPassManager.Properties.Resources.green_dot;
                else
                    status_platform.BackgroundImage = MyPassManager.Properties.Resources.red_dot;
            }
            #endregion

            #region Update Account Data
            // update account data
            if (GetPlatformTargetFromId(platformResults,OldAccountData.PlatformId).Name != tb_platform)
                NewAccountData.PlatformId = NewPotentialPlatform.PlatformId;

            if (OldAccountData.Username != tb_username)
                NewAccountData.Username = tb_username;

            if (OldAccountData.Password != tb_password)
                NewAccountData.Password = tb_password;

            if (OldAccountData.Email != tb_email)
                NewAccountData.Email = tb_email;

            if (OldAccountData.Url != tb_url)
                NewAccountData.Url = tb_url;

            Task updateMyAccount = db.UpdateAccount(NewAccountData);
            updateMyAccount.Wait();
            if (updateMyAccount.IsCompleted && updateMyAccount.IsCompletedSuccessfully)
                status_acc_save.BackgroundImage = MyPassManager.Properties.Resources.green_dot;
            else
                status_acc_save.BackgroundImage = MyPassManager.Properties.Resources.red_dot;
            #endregion

            #region Add Account History Change
            AccountHistoryModel saveChange = new AccountHistoryModel() 
            {
                OldAccountData = OldAccountData,
                NewAccountData = NewAccountData,
                Status = 1,
                LastChange = DateTime.Now,
            };
            Task addChangeHistory = db.CreateAccountHistory(saveChange);
            addChangeHistory.Wait();
            if (addChangeHistory.IsCompleted && addChangeHistory.IsCompletedSuccessfully)
                status_acc_history.BackgroundImage = MyPassManager.Properties.Resources.green_dot;
            else
                status_acc_history.BackgroundImage = MyPassManager.Properties.Resources.red_dot;
            
            if (platformWasChanged == false) status_platform.BackgroundImage = MyPassManager.Properties.Resources.yellow_dot;

            timerRefresh = EasyTimer.SetTimeout(() =>
            {
                status_acc_save.BackgroundImage = MyPassManager.Properties.Resources.grey_dot;
                status_acc_history.BackgroundImage = MyPassManager.Properties.Resources.grey_dot;
                status_platform.BackgroundImage = MyPassManager.Properties.Resources.grey_dot;
            },2000);

            #endregion
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
            }
            else
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
                textBox_platform.BeginInvoke((MethodInvoker)delegate () { textBox_platform.Text = "".ToString(); });
                textBox_password.BeginInvoke((MethodInvoker)delegate () { textBox_password.Text = "".ToString(); });
                textBox_email.BeginInvoke((MethodInvoker)delegate () { textBox_email.Text = "".ToString(); });
                textBox_url.BeginInvoke((MethodInvoker)delegate () { textBox_url.Text = "".ToString(); });
                textBox_username.BeginInvoke((MethodInvoker)delegate () { textBox_username.Text = "".ToString(); });

            }, 3000);
            //Debug.WriteLine(newTask.IsCanceled);
            //Debug.WriteLine(newTask.IsCompleted);
            //Debug.WriteLine(newTask.IsCompletedSuccessfully);
            //Debug.WriteLine(newTask.IsFaulted);
            //Debug.WriteLine(newTask.Status);
        }

        private Dictionary<string, int> GetAllPlatformsData(List<PlatformModel> listOfPlatforms)
        {
            Dictionary<string, int> SortedPlatforms = new Dictionary<string, int>();

            foreach (var plat in listOfPlatforms)
            {
                if (!SortedPlatforms.ContainsKey(plat.Name))
                    SortedPlatforms.Add(plat.Name, plat.PlatformId);
            }

            return SortedPlatforms;
        }
        private PlatformModel GetPlatformTargetFromId(List<PlatformModel> listOfPlatforms, int id)
        {
            PlatformModel platformModel= new();
            foreach (var plat in listOfPlatforms)
            {
                if (plat.PlatformId == id)
                    platformModel = plat;
            }

            return platformModel;
        }
        private void pictureBox1_Click(object sender, EventArgs e)
        {
            PasswordGenerator PasswordGenerator = new PasswordGenerator();
            string passwordGenerated = PasswordGenerator.Generate();
            tb_password = passwordGenerated.ToString();
        }

        private void updateAccountForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            timerRefresh.Dispose();
        }
    }
}
