using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class PlayerMovement : MonoBehaviour
{
    public float movementSpeed = 5f;
    public float flipSpeed = .5f;
    public Powers powers_affected;
    public int turnEnemyOnOff = 0;
    public bool movingRight = false;
    // public GameManager GMInstance;

    public Rigidbody2D rb;
    Vector2 movement;

    private void Start() {
    }

    void Update() 
    {

        if (Input.GetKeyDown(KeyCode.Alpha0))
        {
            turnEnemyOnOff++;
            if (turnEnemyOnOff >= 2)
            {
                Enemy enem = GameObject.FindObjectOfType<Enemy>();
                enem.canMove = !enem.canMove;
                turnEnemyOnOff = 0;
            }
        }
        
        if (GameManager.instance.GameStatus().isPaused) return;

        movement.x = Input.GetAxisRaw("Horizontal");
        movement.y = Input.GetAxisRaw("Vertical");
        Vector3 playerScale = transform.localScale;

        // if player moves left/right, flip accordingly
        if (movement.x == -1) { // left
            playerScale.Set(Mathf.Lerp(playerScale.x,-1,flipSpeed),playerScale.y,playerScale.z);
            movingRight = false;
        }
        if (movement.x == 1) {
            playerScale.Set(Mathf.Lerp(playerScale.x,1,flipSpeed),playerScale.y,playerScale.z);
            movingRight = true;
        }
        
        // same for up/down
        if (movement.y == -1) playerScale.Set(playerScale.x,Mathf.Lerp(playerScale.y,-1,flipSpeed),playerScale.z);
        if (movement.y == 1) playerScale.Set(playerScale.x,Mathf.Lerp(playerScale.y,1,flipSpeed),playerScale.z);

        // if player doesn't move down, set player up
        if (movement.y == 0) playerScale.Set(playerScale.x,1,playerScale.z);
        if (!movingRight)
            playerScale.Set(Mathf.Lerp(playerScale.x,-1,1),playerScale.y,playerScale.z);
        else
            playerScale.Set(Mathf.Lerp(playerScale.x,1,1),playerScale.y,playerScale.z);

        transform.localScale = playerScale;
    }

    void FixedUpdate()
    {
        rb.MovePosition(rb.position + movement.normalized * movementSpeed * Time.fixedDeltaTime);
    }
}
