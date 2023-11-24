using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LeaveScript : MonoBehaviour
{
    public GameObject pauseScreen;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    private void OnTriggerEnter2D(Collider2D other) {
        
        Debug.Log($"{other.name} entered!");
        Time.timeScale = 0;
        pauseScreen.SetActive(true);
    }
}
