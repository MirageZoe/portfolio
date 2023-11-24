using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;
using System;

[Serializable]
public struct Level
{
    public string namae;
    public Sprite icon;
    public int stars;
}


public static class ButtonExtension
{
    public static void AddEventListener<T>(this Button button, T param, Action<T> OnClick)
    {
        button.onClick.AddListener(delegate(){
           OnClick(param);
        });
    }
}

public class listLevels : MonoBehaviour
{
    [SerializeField] Level[] myLevels;
    public Sprite filledStar;

    // Start is called before the first frame update
    void Start()
    {
        GameObject button_template = transform.GetChild(0).gameObject;
        GameObject g;
        for (int i = 0; i < myLevels.Length; i++)
        {
            g = Instantiate(button_template,transform);
            g.transform.GetChild(0).GetComponent<TextMeshProUGUI>().text = myLevels[i].namae;
            g.transform.GetChild(1).GetComponent<Image>().sprite = myLevels[i].icon;

            if (myLevels[i].stars >= 1)
                g.transform.GetChild(2).GetChild(0).GetComponent<Image>().sprite = filledStar;
            if (myLevels[i].stars >= 2)
                g.transform.GetChild(2).GetChild(1).GetComponent<Image>().sprite = filledStar;
            if (myLevels[i].stars >= 3)
                g.transform.GetChild(2).GetChild(2).GetComponent<Image>().sprite = filledStar;

            g.GetComponent<Button>().AddEventListener(i,ItemClicked);
            
        }
        Destroy(button_template);
    }

    void ItemClicked(int indexItem)
    {
        Debug.Log("User chose "+myLevels[indexItem].namae);
        Debug.Log("User chose "+indexItem);
        // if (indexItem == 0)
        // {
        //     SceneManager.LoadScene("tutorial");
        //     GameManager.instance.currentLevel = Levels.Tutorial;
        // }
        if (indexItem == 0)
        {
            SceneManager.LoadScene("level 1");
            GameManager.instance.currentLevel = Levels.Level1;
        }
        if (indexItem == 1)
        {
            SceneManager.LoadScene("level 2");
            GameManager.instance.currentLevel = Levels.Level2;
        }
        if (indexItem == 2)
        {
            SceneManager.LoadScene("level 3");
            GameManager.instance.currentLevel = Levels.Level3;
        }
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
