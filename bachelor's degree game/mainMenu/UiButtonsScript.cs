using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using System;
using System.IO;

public class UiButtonsScript : MonoBehaviour
{
    public static UiButtonsScript instance;
    [SerializeField] private int score = 0;
    public TextMeshProUGUI endText;
    public TextMeshProUGUI scoreText;
    public TextMeshProUGUI totalPointsEND;
    public TextMeshProUGUI usernameText;
    public TextMeshProUGUI warningText;
    public bool isPaused = false;
    public GameManager GMInstance;
    public GameObject[] menuAreas;
    public GameObject PanelScoreboard;
    public Sprite filledStar;

    public bool iDisabledWarningText = true;
    public float cooldownDisableText = 3f;
    public float cooldownLeft = 0f;

    private void Awake() {
        instance = this;
    }

    private void Start() {
        GMInstance = GameObject.FindObjectOfType<GameManager>();
        isPaused = GMInstance.GameStatus().isPaused;
        
    }

    private void Update() {
        isPaused = GMInstance.GameStatus().isPaused;
        if (Input.GetKeyDown(KeyCode.Escape) && SceneManager.GetActiveScene().name != "MainMenu")
        {
            if (!isPaused)
            {
                GMInstance.GamePause(false);
                menuAreas[0].SetActive(true);
            }
            else
            {
                GMInstance.GameUnPause();
                menuAreas[0].SetActive(false);
            }
        }
        if (cooldownLeft >= 0.1f) cooldownLeft -= Time.unscaledDeltaTime;
        if (cooldownLeft < 0.1f && iDisabledWarningText == false)
        {
            Debug.Log("[UiButtonScript]: disabled warning text");
            warningText.gameObject.SetActive(false);
            iDisabledWarningText = true;
        }
    }

    public void AddPoints(float points)
    {
        score += (int) points;
        scoreText.text = score.ToString();
    }

    public void PlayButton()
    {
        menuAreas[0].SetActive(false);
        menuAreas[1].SetActive(true);
    }

    public void BackButton()
    {
        foreach (var item in menuAreas)
        {
            item.SetActive(false);
        }
        menuAreas[0].SetActive(true);
    }

    public void SelectMenu(int menu)
    {
        menuAreas[0].SetActive(false);
        menuAreas[menu].SetActive(true);
    }

    public void ExitButton()
    {
        Debug.Log("Player closed the game");
        Application.Quit(1);
    }

    public void FreshStart()
    {
        menuAreas[1].SetActive(false);
        menuAreas[2].SetActive(true);
    }

    public void ResumeGame()
    {
        GMInstance.GameUnPause();
        menuAreas[0].SetActive(false);
    }

    public void MainMenu()
    {
        GMInstance.currentLevel = Levels.MainMenu;
        GMInstance.unComplete();
        GMInstance.GameUnPause();
        SceneManager.LoadScene("MainMenu");
    }

    public void EndLevelScreen()
    {
        Time.timeScale = 0;
        GMInstance.GamePause(true);
        menuAreas[2].SetActive(true);
        // check if we reached the boundaries of levels so we can disable nextLevel/previousLevel
        if (GMInstance.currentLevel == Levels.Level3) 
            GameObject.Find("nextLevel").SetActive(false);
        if (GMInstance.currentLevel == Levels.Level1) 
            GameObject.Find("previousLevel").SetActive(false);

        // display the points
        endText.text = "Congrats! You have finished this level! \nYou have gathered a total of:";
        if (GMInstance.GameStatus().isLost) 
            endText.text = "Aw, you got caught! Maybe you have better luck next time :) ";
        totalPointsEND.text = score.ToString()+" points!";
        Debug.Log("tried to set the points!"+totalPointsEND.text);

        // disable the points from left  top
        scoreText.transform.parent.gameObject.SetActive(false);
    }

    public void PreviousLevelButton()
    {
        string levelToLoad = "level 1";
        switch (GMInstance.currentLevel)
        {
            case Levels.Level3:
                levelToLoad = "level 2";
                GMInstance.currentLevel = Levels.Level2;
            break;
            case Levels.Level2:
                levelToLoad = "level 1";
                GMInstance.currentLevel = Levels.Level1;
            break;
        }
        Debug.Log("Loaded "+levelToLoad);
        GMInstance.unComplete();
        GMInstance.GameUnPause();
        SceneManager.LoadScene(levelToLoad);
    }

    public void NextLevelButton()
    {
        string levelToLoad = "level 1";
        switch (GMInstance.currentLevel)
        {
            case Levels.Level1:
                levelToLoad = "level 2";
                GMInstance.currentLevel = Levels.Level2;
            break;
            case Levels.Level2:
                levelToLoad = "level 3";
                GMInstance.currentLevel = Levels.Level3;
            break;
        }
        Debug.Log("Loaded "+levelToLoad);
        GMInstance.unComplete();
        GMInstance.GameUnPause();
        SceneManager.LoadScene(levelToLoad);
    }

    public void RestartLevelButton()
    {
        GMInstance.unComplete();
        GMInstance.GameUnPause();
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    public void SetScore(int sc)
    {
        score = sc;
        Debug.Log("UiManager: Score was set to: "+sc);
    }

    public int GetScore()
    {
        return score;
    }

    public void SaveProgress()
    {
        if (usernameText.text.Length < 3 || usernameText.text.Length > 12 )
        {
            warningText.text = "Please add an username that has more than 3 characters & lower than 12 characters! (all inclusive)";
            warningText.gameObject.SetActive(true);
            iDisabledWarningText = false;
            cooldownLeft = cooldownDisableText;
            return;
        }
        SaveSystem.SavePlayerData();
        Debug.Log("[UiButtonScript]: GameData Saved!");
        warningText.text = "Your score has been saved!";
        warningText.gameObject.SetActive(true);
        iDisabledWarningText = false;
        cooldownLeft = cooldownDisableText;
    }

    public void DeleteScoreboard()
    {
        int result = SaveSystem.DeletePlayerData();
        switch (result)
        {
            case 0:
                Debug.Log($"[UiButtonScript]: Nothing happened check SaveSystem file!");
            break;
            case 1:
                Debug.Log($"[UiButtonScript]: The scoreboard has been cleared!");
                warningText.text = "The Scoreboard was cleared!";
                warningText.gameObject.SetActive(true);
                iDisabledWarningText = false;
                cooldownLeft = cooldownDisableText;
                if (PanelScoreboard.transform.childCount > 1)
                for (int i = 1; i < PanelScoreboard.transform.childCount; i++)
                {
                    Debug.Log($"[UiButtonScript]: Destroying the following child: {PanelScoreboard.transform.GetChild(i).name}");
                    Destroy(PanelScoreboard.transform.GetChild(i).gameObject);
                }
            break;
            case 2:
                Debug.Log($"[UiButtonScript]: The file was not found!");
                warningText.text = "The savefile couldn't be found! Are u sure it exists or it's in the right path?";
                warningText.gameObject.SetActive(true);
                iDisabledWarningText = false;
                cooldownLeft = cooldownDisableText;
            break;
            case 3:
                Debug.Log($"[UiButtonScript]: An Error happened!");
                warningText.text = "Unfortunately the operation couldn't be performed(delete). Please check logs for errors!";
                warningText.gameObject.SetActive(true);
                iDisabledWarningText = false;
                cooldownLeft = cooldownDisableText;
            break;
            default:
                Debug.Log($"[UiButtonScript]: This case was not treated! CODE:{result}");
                warningText.text = $"This case was not treated in the script. CODE: {result}";
                warningText.gameObject.SetActive(true);
                iDisabledWarningText = false;
                cooldownLeft = cooldownDisableText;
            break;
        }
    }

    public void ReloadScoreboard()
    {
        // clean-up crew: making sure it's only the template inside!
        if (PanelScoreboard.transform.childCount > 1)
        {
            for (int i = 1; i < PanelScoreboard.transform.childCount; i++)
            {
                Debug.Log($"[UiButtonScript]: Destroying the following child: {PanelScoreboard.transform.GetChild(i).name}");
                Destroy(PanelScoreboard.transform.GetChild(i).gameObject);
            }
        }

        List<SaveData> myScoreBoard = SaveSystem.LoadPlayerData();

        GameObject playerView_template = PanelScoreboard.transform.GetChild(0).gameObject;
        GameObject g;

        if (!File.Exists(SaveSystem.defaultSavePath+SaveSystem.defaultFileSaveName)) {
            Debug.LogError($"I couldn't find the database of scoreboard. Not continuing the scoreboard code!");
            warningText.text = "Please play a level and save your progress to display here!";
            warningText.gameObject.SetActive(true);
            iDisabledWarningText = false;
            cooldownLeft = cooldownDisableText;
            return;
        }
        for (int i = 0; i < myScoreBoard.Count; i++)
        {
            g = Instantiate(playerView_template,PanelScoreboard.transform);
            g.transform.GetChild(0).GetComponent<TextMeshProUGUI>().text = myScoreBoard[i].playerName;
            g.transform.GetChild(3).GetComponent<TextMeshProUGUI>().text = $"{System.TimeSpan.FromSeconds(myScoreBoard[i].playerTime).Minutes.ToString()}:{System.TimeSpan.FromSeconds(myScoreBoard[i].playerTime).Seconds.ToString()}";
            
            DateTime ndate = new DateTime(1970,1,1).AddSeconds(myScoreBoard[i].playerDate);
            

            g.transform.GetChild(5).GetComponent<TextMeshProUGUI>().text = $"{ndate.Month}/{ndate.Day}/{ndate.Year.ToString().Substring(2)}";//{ndate.Month}/{ndate.Day}/{ndate.Year}/

            g.transform.GetChild(7).GetComponent<TextMeshProUGUI>().text = myScoreBoard[i].playerLevel;

            if (myScoreBoard[i].playerScore >= 500)
                g.transform.GetChild(1).GetChild(0).GetComponent<Image>().sprite = filledStar;
            if (myScoreBoard[i].playerScore >= 1000)
                g.transform.GetChild(1).GetChild(1).GetComponent<Image>().sprite = filledStar;
            if (myScoreBoard[i].playerScore >= 1500)
                g.transform.GetChild(1).GetChild(2).GetComponent<Image>().sprite = filledStar;

            // g.GetComponent<Button>().AddEventListener(i,ItemClicked);
            
        }
        // Destroy(playerView_template);
        playerView_template.SetActive(false);
    }
    
    public static DateTime UnixTimeStampToDateTime( double unixTimeStamp )
    {
        // Unix timestamp is seconds past epoch
        DateTime dateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
        dateTime = dateTime.AddSeconds( unixTimeStamp );
        return dateTime;
    }

}
