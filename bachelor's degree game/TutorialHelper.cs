using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TutorialHelper : MonoBehaviour
{
    public bool info = false;
    public bool trial_portal = false;
    public bool trial_portal_done = false;

    public Vector2 teleportCoords;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    private void OnTriggerEnter2D(Collider2D other) 
    {    
        if (info)
        transform.GetChild(0).GetComponent<SpriteRenderer>().enabled = true;

        if (trial_portal && trial_portal_done == false)
        {
            trial_portal_done = true;
            other.transform.position = new Vector3(teleportCoords.x, teleportCoords.y,other.transform.position.z);
            Camera cam = GameObject.FindObjectOfType<Camera>(); 
            cam.transform.position = new Vector3(cam.transform.position.x,-10,-10);
        }
    }

    private void OnTriggerExit2D(Collider2D other) 
    {
        if (info)
        transform.GetChild(0).GetComponent<SpriteRenderer>().enabled = false;

        
    }
}
