using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy : MonoBehaviour
{
    private A_Star_Pathfinding _pathfindingAlgorithm = null;
	private GridCreator _gridCreator = null;

    public bool canMove = false;
    public bool requestNewPath = true;
    public bool debugLog = false;
    public bool trackPlayer = false;
    public int counterPath = 0;
    public float movementSpeed = 3f;
    public float roughEstimation = .125f;
    public float lookView = 0f;
    public Powers powers_affected;
    public WorldTile startingPoint;
    public WorldTile endingPoint;
    public List<Vector3> moveTrack;
    public List<WorldTile> pathToPoint = new List<WorldTile>();
    
    #region settings to target the player
    public GameObject myPlayer;
    public float remaininTimeToRequest = 0f;
    public float cooldownToRequest = 5f;
    public bool resetPathToPlayer = false;
    #endregion

    // Start is called before the first frame update
    void Start()
    {
        _pathfindingAlgorithm = GameObject.FindObjectOfType<A_Star_Pathfinding>();
        _gridCreator = GameObject.FindObjectOfType<GridCreator>();
        // if (!myPlayer) myPlayer = GameObject.FindObjectOfType<PlayerMovement>().gameObject;
    }

    // Update is called once per frame
    void Update()
    {
        if (trackPlayer && remaininTimeToRequest >= 0.1f) remaininTimeToRequest -= Time.deltaTime;
        if (trackPlayer && remaininTimeToRequest < 0.1f) 
        {
            remaininTimeToRequest = cooldownToRequest;
            resetPathToPlayer = true;
        }
        DoWork();
    }

    public void DoWork()
    {
        if (!canMove) return;
        // get the tile the enemy is standing on
        Vector2 myPos = new Vector2(transform.position.x,transform.position.y);
        startingPoint = _gridCreator.GetTileFromCoordinates(myPos);

        // get the destination tile
        Vector2 desPos = new Vector2( moveTrack[counterPath].x, moveTrack[counterPath].y);
        if (!trackPlayer)
            endingPoint = _gridCreator.GetTileFromCoordinates(desPos);
        else
            endingPoint = _gridCreator.GetTileFromCoordinates(myPlayer.transform.position);

        // get the path (a list of WorldTiles) to the first point.
        if (requestNewPath == true) {
            pathToPoint = _pathfindingAlgorithm.RunAlgorithm(startingPoint,endingPoint);
            if (debugLog) Debug.Log("Enemy: Requested new path!");
            // if (!trackPlayer)
            requestNewPath = false;
        }

        lookView = AngleDir(pathToPoint[0].transform.position,transform.position);
        SpriteRenderer sprite = GetComponent<SpriteRenderer>();
        if (lookView < 0) sprite.flipX = true;
        if (lookView > 0) sprite.flipX = false;

        // we moving towards the target coords
        if (debugLog) Debug.Log($"{pathToPoint[0].name} {pathToPoint[0].gameObject.name}");
        transform.position = Vector3.MoveTowards(transform.position, pathToPoint[0].transform.position, movementSpeed * Time.deltaTime);
        if (resetPathToPlayer) {
            pathToPoint.RemoveRange(1, pathToPoint.Count-1);
            resetPathToPlayer = false;
        }

        if (RoughlyEqual(transform.position.x, pathToPoint[0].transform.position.x, roughEstimation) && 
            RoughlyEqual(transform.position.y, pathToPoint[0].transform.position.y, roughEstimation)) {
            if (debugLog) Debug.Log("Enemy: Removed point bcs I reached it.");
            pathToPoint.RemoveAt(0);
            if (pathToPoint.Count == 0) {
                // if (!trackPlayer) 
                requestNewPath = true;
                counterPath++;
                if (counterPath >= moveTrack.Count) counterPath = 0;
            }
            if (GameManager.instance.GetDebugAIDots())
                foreach(GameObject tile in _gridCreator.nodes)
                {
                    if (tile == null) continue;
                    WorldTile tempTile = tile.GetComponent<WorldTile>();
                    if (pathToPoint.Contains(tempTile))
                        tile.gameObject.GetComponent<SpriteRenderer>().color = Color.yellow;
                    else if (tempTile.walkable)
                        tile.gameObject.GetComponent<SpriteRenderer>().color = Color.blue;
                }
            else
                foreach(GameObject tile in _gridCreator.nodes)
                {
                    if (tile == null) continue;
                    WorldTile tempTile = tile.GetComponent<WorldTile>();
                        tile.gameObject.GetComponent<SpriteRenderer>().color = Color.clear;
                }
        }
    }

    private void OnCollisionEnter2D(Collision2D other) {

        if (other.gameObject.tag == "Player")
        {
            GameManager.instance.LostRound();
            if (debugLog) Debug.Log("Player got caught");
            UiButtonsScript.instance.EndLevelScreen();
        }
    }

    static bool RoughlyEqual(float a, float b, float threshold) {
        return (Mathf.Abs(a-b)< threshold );
    }
    
    private Vector3 GetMouseWorldPosition()
    {
        // capture mouse position & return worldpoint
        return Camera.main.ScreenToWorldPoint(Input.mousePosition);
    }

    public float AngleDir(Vector2 A, Vector2 B)
    {
        return -A.x * B.y + A.y * B.x;
    }
}