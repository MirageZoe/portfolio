using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.Audio;

public enum Levels {
    MainMenu = 0,
    Tutorial = 1,
    Level1 = 2,
    Level2 = 3,
    Level3 = 4,
    Extra = 5
}
public struct GameStatus
{
    public bool isLost;
    public bool isPaused;
    public bool isCompleted;

    public GameStatus(bool _isPaused, bool _isLost, bool _isCompleted)
    {
        isLost = _isLost;
        isPaused = _isPaused;
        isCompleted = _isCompleted;
    }
}

public class GameManager : MonoBehaviour
{
    public static GameManager instance;
    public Levels currentLevel = Levels.MainMenu;
    public Levels currentLevelOld = Levels.MainMenu;
    public bool debugLog = true;
    [SerializeField] bool isPaused = false;
    [SerializeField] bool isCompleted = false;
    [SerializeField] bool isLost = false;
    [SerializeField] bool levelEditor = false;
    [SerializeField] bool showDotsOnMap = false;
    
    float timePassed = 0f;

    public Camera cam;

    #region 
    public float mainVolume = 1f;
    public float musicVolume = 1f;
    public float sfxVolume = 1f;
    
    #endregion

    void Awake()
    {
        SoundManager.Initialize();
        if (instance != null)
        {
            Destroy(gameObject);
        }
        else
        {
            instance = this;
        }
        DontDestroyOnLoad(gameObject);
    }


    // Update is called once per frame
    void Update()
    {
        if ((currentLevel == Levels.Level1 || 
        currentLevel == Levels.Level2 || 
        currentLevel == Levels.Level3) && (!isPaused || !isCompleted || !isLost))
            timePassed+= Time.deltaTime;
        
        // find references when loading new scenes
        if (!cam)
        {
            cam = GameObject.FindObjectOfType<Camera>();
            Debug.Log("GameManager: linked reference for camera again!");
        }

        if (Input.GetKeyDown(KeyCode.G))
        {
            Debug.Log(Application.dataPath);
        }

    }

    public GameStatus GameStatus()
    {
        GameStatus currentGame = new GameStatus(isPaused, isLost,isCompleted);
        return currentGame;
    }

    public void GamePause(bool completed)
    {
        if (completed) isCompleted = true;
        Debug.Log("GameManager: Game was paused");
        isPaused = true;
        Time.timeScale = 0;
    }

    public void GameUnPause()
    {
        if (isCompleted) 
        {
            Debug.Log("Not working because level was completed");
            return;
        }
        Debug.Log("GameManager: Game was unpaused");
        isPaused = false;
        Time.timeScale = 1;
    }

    public void unComplete()
    {
        isCompleted = false;
        isLost = false;
        isPaused = false;
        timePassed = 0f;
    }

    public void LostRound()
    {
        isLost = true;
    }

    public bool GetLevelEditorState()
    {
        return levelEditor;
    }
    
    public SaveData CreateSaveObject()
    {
        // PlayerMovement player = GameObject.FindObjectOfType<PlayerMovement>();
        // Enemy theEnemy =  GameObject.FindObjectOfType<Enemy>();
        //TimeSpan.FromSeconds(numOfSecs).Hours

        int currentScore = GameObject.FindObjectOfType<UiButtonsScript>().GetScore();
        string namae = UiButtonsScript.instance.usernameText.text;
        string lvl = "Lv.1";
        if (currentLevel == Levels.Level2)
            lvl = "Lv.2";
        if (currentLevel == Levels.Level3)
            lvl = "Lv.3";
        
        SaveData saveGame = new SaveData(currentScore,(int)timePassed,namae,lvl);

        return saveGame;
    }

    public bool GetDebugAIDots()
    {
        return showDotsOnMap;
    }

    public void SetDebugAIDots(bool onOff)
    {
        showDotsOnMap = onOff;
    }
}
