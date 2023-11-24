using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

[System.Serializable]
public class SaveData 
{
    
    public string playerName;
    public string playerLevel;
    public int playerScore;
    public int playerTime;
    public long playerDate;
    // public float playerPosX;
    // public float playerPosY;
    
    // public float enemyPosX;
    // public float enemyPosY;

    // public float[] moveTrack;

    public SaveData(int PScore,int PTime,string name, string level)//PlayerMovement player, Enemy enemy,
    {
        playerScore = PScore;
        playerTime = PTime;
        playerDate = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds();
        playerName = name;
        playerLevel= level;
        // playerPosX = player.transform.position.x;
        // playerPosY = player.transform.position.y;
        // enemyPosX = enemy.transform.position.x;
        // enemyPosY = enemy.transform.position.y;

        // moveTrack = new float[enemy.moveTrack.Count];
    }
}
