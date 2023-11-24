using UnityEngine;
using System.IO;// to write file
using System.Runtime.Serialization.Formatters.Binary;// to make binary file and use BinaryFormatter
using System.Linq; // so we have OfType and ToList
using System.Collections.Generic;// for lists

public static class SaveSystem
{
    public static string defaultSavePath = Application.dataPath + "/Db";
    public static string defaultFileSaveName = "/sb.mgl";// MyGameLicense :) 
    public static void SavePlayerData ()
    {
        BinaryFormatter formatter = new BinaryFormatter();
        // string path = Application.persistentDataPath + "/sgd_base.fun";
        // string path = System.Environment.GetFolderPath(
        //         System.Environment.SpecialFolder.Desktop)+ "/YOUR_LOGS/tempSave.txt";
        // Debug.Log(path);
        // FileStream stream = new FileStream(path,FileMode.Create);

        if (File.Exists(defaultSavePath+defaultFileSaveName))// if the scoreboard exist, append to it
        {
            #region Read old scoreboard and get it back as a list
            StreamReader sr = new StreamReader(defaultSavePath+defaultFileSaveName);

            string JsonString = sr.ReadToEnd();
            sr.Close();
            SaveData[] _tempPlayerScoreboard = JsonHelper.FromJson<SaveData>(JsonString);
            List<SaveData> scoreboardList = _tempPlayerScoreboard.OfType<SaveData>().ToList();
            foreach (var item in scoreboardList)
            {
                Debug.Log($"Got: {item.playerName} with {item.playerScore} score on {item.playerLevel}!");
            }
            #endregion

            #region Append new score
            SaveData currentPlayer = GameManager.instance.CreateSaveObject();
            scoreboardList.Add(currentPlayer);
            #endregion

            #region Jsonify and save to file
            string JsonString2 = JsonHelper.ToJson(scoreboardList.ToArray());

            StreamWriter sw = new StreamWriter(defaultSavePath+defaultFileSaveName);
            sw.Write(JsonString2);
            sw.Close();
            #endregion

            Debug.Log("[SaveSystem]: Modified and saved new data!");
        }
        else// create new scoreboard
        {
            List<SaveData> scoreboardList = new List<SaveData>();
            SaveData currentPlayer = GameManager.instance.CreateSaveObject();
            scoreboardList.Add(currentPlayer);

            
            // creating the data and jsonString
            string JsonString = JsonHelper.ToJson(scoreboardList.ToArray());

            // write to file
            if(!Directory.Exists(defaultSavePath))
            {    
                //if it doesn't, create it
                Directory.CreateDirectory(defaultSavePath);
                Debug.Log($"[SaveSystem]: Created \"Db\" because it didn't exist.");
            }
            StreamWriter sw = new StreamWriter(defaultSavePath+defaultFileSaveName);
            sw.Write(JsonString);
            sw.Close();
            Debug.Log("[SaveSystem]: Created and saved new data!");
        }

        // formatter.Serialize(stream,data);
        // stream.Close();
    }

    public static List<SaveData> LoadPlayerData ()
    {
        // string path = Application.persistentDataPath + "/sgd_base.fun";
        // string path = System.Environment.GetFolderPath(
        //         System.Environment.SpecialFolder.Desktop)+ "/YOUR_LOGS/tempSave.txt";
        if (File.Exists(defaultSavePath+defaultFileSaveName))
        {
            // BinaryFormatter formatter = new BinaryFormatter();
            // FileStream stream = new FileStream(path,FileMode.Open);

            // SaveData data = formatter.Deserialize(stream) as SaveData;
            // stream.Close();
            #region Read old scoreboard and get it back as a list
            StreamReader sr = new StreamReader(defaultSavePath+defaultFileSaveName);

            string JsonString = sr.ReadToEnd();
            sr.Close();
            SaveData[] _tempPlayerScoreboard = JsonHelper.FromJson<SaveData>(JsonString);
            List<SaveData> scoreboardList = _tempPlayerScoreboard.OfType<SaveData>().ToList();
            foreach (var item in scoreboardList)
            {
                Debug.Log($"Got: {item.playerName} with {item.playerScore} score of {item.playerLevel} on {item.playerDate}!");
            }
            #endregion
            return scoreboardList;
        }
        else
        {
            Debug.LogError("Save file couldn't be found in: "+defaultSavePath+defaultFileSaveName);
            return null;
        }
    }

    public static int DeletePlayerData()
    {
        int operationProgress = 0;
        // 0 => nothing happened;
        // 1 => deleted successfully;
        // 2 => file not found;
        // 3 => error;
        try
        {
            if (File.Exists(defaultSavePath+defaultFileSaveName))// if the scoreboard exist, append to it
            {
                File.Delete(defaultSavePath+defaultFileSaveName);
                Debug.Log("[SaveSystem]: Savefile was found and deleted successfully!");
                operationProgress = 1;
            } else {
                Debug.Log("[SaveSystem]: Savefile was not found! Check if it's created yet or if the path is right!");
                operationProgress = 2;
            }
        }
        catch (System.Exception ex)
        {
            operationProgress = 3;
            Debug.Log($"[SaveSystem]: An error happened while trying to delete the savefile! {ex.Message}");
        }
        return operationProgress;
    }
}
