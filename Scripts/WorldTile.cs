using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Container class to be used for pathing algorithms
/// </summary>

public class WorldTile : MonoBehaviour
{
	public int gCost = 0;
	public int hCost = 0;
	public int gridX, gridY, cellX, cellY;
	public bool walkable = true;
	public List<WorldTile> myNeighbours;
	public WorldTile parent;
	public GameObject _highlight;
	GameObject entity;
	public bool debugLog = false;
	public UiButtonsScript uiButtonsScript;
	public GameObject playerPref;

	#region Powers Variables

	public Powers tilePower = Powers.None;
	public bool isEntityOnPortal = false;
	public float powerAmount = 0f;
	public float portalChannelTime;
	public float portalCooldownLeft = 0;
	public float portalChanneledLeft = 0;
	public bool playerPlaySound = false;
	public GameObject portalRefWT;
	public bool cheeseEaten = false;

	#endregion


	public WorldTile(bool _walkable, int _gridX, int _gridY)
	{
		walkable = _walkable;
		gridX = _gridX;
		gridY = _gridY;
	}

	public int fCost
	{
		get
		{
			return gCost + hCost;
		}
	}

	private void Start() {
		uiButtonsScript = GameObject.FindObjectOfType<UiButtonsScript>();
		
	}

	private void OnMouseEnter() {
        _highlight.SetActive(true); 
    }

    private void OnMouseExit() {
        _highlight.SetActive(false);
    }

	private void Update() {
		if (portalCooldownLeft > 0.01) portalCooldownLeft -= Time.deltaTime;
		
		if (isEntityOnPortal) {

			if (portalCooldownLeft > 0.01) return;

			portalChanneledLeft += Time.deltaTime;

			if (!playerPlaySound && entity.tag == "Player")
			{
				SoundManager.PlaySound(SoundManager.Sound.Teleport,0.5f);
				playerPlaySound = true;
			}

			if (portalChanneledLeft >= portalChannelTime) {
				Debug.Log($"[Portal-{cellX}|{cellY}]: Teleported {entity.name} to {portalRefWT.transform.position}");
				if (entity.GetComponent<Enemy>() != null)
				{
					Enemy theEnemy = entity.GetComponent<Enemy>();
					theEnemy.canMove = false;
					theEnemy.pathToPoint.RemoveRange(1,theEnemy.pathToPoint.Count-1);
					entity.transform.position = new Vector3(portalRefWT.transform.position.x,portalRefWT.transform.position.y,0);
					theEnemy.counterPath++;
					theEnemy.pathToPoint[0] = GridCreator.instance.GetTileFromCoordinates(theEnemy.transform.position);
					portalChanneledLeft = 0;
					portalCooldownLeft = powerAmount;
					portalRefWT.GetComponent<WorldTile>().portalCooldownLeft = powerAmount;
					theEnemy.canMove = true;
					playerPlaySound = false;
					isEntityOnPortal = false;
					return;
				}
				entity.transform.position = new Vector3(portalRefWT.transform.position.x,portalRefWT.transform.position.y,0);
				portalChanneledLeft = 0;
				// setting the current portal cooldown 
				portalCooldownLeft = powerAmount;
				// setting other portal cooldown
				portalRefWT.GetComponent<WorldTile>().portalCooldownLeft = powerAmount;

			}
		}
	}

	private void OnTriggerEnter2D(Collider2D other) {
		
		if (tilePower == Powers.Cheese) {
			Debug.Log($"({other.name}) stepped on the 'Cheese' tile! Player gets 500 points!");
			
			if (other.tag == "Player") {
				if (cheeseEaten) return;
				SoundManager.PlaySound(SoundManager.Sound.Cheese, transform.position, 0.4f);
				uiButtonsScript.AddPoints(powerAmount);
				GridCreator.instance.powerFloor.SetTile(new Vector3Int(cellX,cellY,0),null);
				cheeseEaten = true;
			}
		}

		if (tilePower == Powers.Slow) {

			Debug.Log($"({other.name}) stepped on the 'Slow' tile! It's movement speed is reduced by 2!");
			
			if (other.tag == "Player") {
				PlayerMovement playerData =  other.GetComponent<PlayerMovement>();

				if (playerData.powers_affected.HasFlag(Powers.Slow)) return;

				playerData.movementSpeed -= powerAmount;
				playerData.powers_affected ^= Powers.Slow;

				if (powerAmount > 0)
					SoundManager.PlaySound(SoundManager.Sound.Slow);

				if (powerAmount < 0)
					SoundManager.PlaySound(SoundManager.Sound.Speed);

			}
			if (other.tag == "Enemy") {
				Enemy enemyData = other.GetComponent<Enemy>();

				if (enemyData.powers_affected.HasFlag(Powers.Slow)) return;

				enemyData.movementSpeed -= powerAmount;
				enemyData.powers_affected ^= Powers.Slow;
			}

		}

		if (tilePower == Powers.Portal) {
			// if (other.tag != "Player") return;
			Debug.Log($"({other.name}) stepped on 'Portal' tile!");
			isEntityOnPortal = true;
			entity = other.gameObject;
		}

		if (tilePower == Powers.Nail) {
			Debug.Log($"({other.name}) stepped on the 'Nail' tile! Player gets slowed 2.5, enemies sleep for 2.5s!");

			if (other.tag == "Player") {
				PlayerMovement playerData =  other.GetComponent<PlayerMovement>();

				if (playerData.powers_affected.HasFlag(Powers.Nail)) return;

				playerData.movementSpeed -= powerAmount;
				playerData.powers_affected ^= Powers.Nail;

			}
			
			if (other.tag == "Enemy") {
				Enemy enemyData = other.GetComponent<Enemy>();

				entity = other.gameObject;// set to help the enemy remove the nails
				if (enemyData.powers_affected.HasFlag(Powers.Nail)) return;

				Debug.Log("Entity sleeps now");
				enemyData.canMove = false;
				enemyData.powers_affected ^= Powers.Nail;

				Invoke("removeNail",powerAmount);
			}
		}
	
		if (tilePower == Powers.EndPoint)
		{
			if (other.tag == "Player")
			{
				uiButtonsScript.EndLevelScreen();
				Debug.Log("Player reached the ending of this level!");
			}
		}
		
		if (tilePower == Powers.StartPoint)
		{
			if (other.tag == "Player")
			{
				// Debug.Log("Player started from here!!");
			}
		}
	}

	private void OnTriggerStay2D(Collider2D other) {

		
		if (tilePower == Powers.Portal){


		}
	}

	private void OnTriggerExit2D(Collider2D other) {
		
		if (tilePower == Powers.Slow) {
			Debug.Log($"({other.name}) left the 'Slow' tile! It's movement speed is back to normal!");
			
			if (other.tag == "Player") {
				PlayerMovement playerData =  other.GetComponent<PlayerMovement>();

				if (!playerData.powers_affected.HasFlag(Powers.Slow)) return;

				playerData.movementSpeed += powerAmount;
				playerData.powers_affected &= ~Powers.Slow;

				// to add the stop function here
				SoundManager.StopOneShotSound();

			}
			if (other.tag == "Enemy") {
				Enemy enemyData = other.GetComponent<Enemy>();

				if (!enemyData.powers_affected.HasFlag(Powers.Slow)) return;

				enemyData.movementSpeed += powerAmount;
				enemyData.powers_affected &= ~Powers.Slow;
			}
		}

		if (tilePower == Powers.Portal) {
			Debug.Log($"({other.name}) left 'Portal' tile! {transform.position.x}|{transform.position.y}");
			isEntityOnPortal = false;
			if (portalCooldownLeft <= 0.01)	portalCooldownLeft = 0;
			portalChanneledLeft = 0;
			entity = null;
			playerPlaySound = false;
			SoundManager.StopOneShotSound();
		}

		if (tilePower == Powers.Nail) {
			Debug.Log($"({other.name}) left the 'Nail' tile! ");

			if (other.tag == "Player") {
				PlayerMovement playerData =  other.GetComponent<PlayerMovement>();
				if (!playerData.powers_affected.HasFlag(Powers.Nail)) return;

				playerData.movementSpeed += powerAmount;
				playerData.powers_affected &= ~Powers.Nail;
			}
		}
	}

	private void OnMouseDown() {
		Debug.Log($"cellX: {cellX} | cellY: {cellY}");
		
		if (!GameManager.instance.GetLevelEditorState()) return;
		Debug.Log("Noted down: "+transform.position.x+":"+transform.position.y);
//		Debug.Log(GridCreator.instance.nodes[cellX,cellY].name);
		Enemy enemyData = GameObject.FindObjectOfType<Enemy>();
		enemyData.moveTrack.Add(new Vector3(transform.position.x,transform.position.y,0));
	}

	private void removeNail()
	{
		Enemy enemyData = entity.GetComponent<Enemy>();
		enemyData.canMove = true;
		enemyData.powers_affected &= ~Powers.Nail;
		tilePower = Powers.None;
		// gameObject.GetComponent<SpriteRenderer>().sprite = null;
		GridCreator.instance.powerFloor.SetTile(new Vector3Int(cellX,cellY,0),null);
		entity = null;
	}

	public void ForcePlayerSpawn()
	{
		Instantiate(playerPref,transform.position,Quaternion.identity,null);
	}

	public void SpawnThePlayer()
	{
		PlayerMovement isSpawnedPlayer = GameObject.FindObjectOfType<PlayerMovement>();
		if (isSpawnedPlayer == null)
		{
			Debug.Log("Tried to spawn Player");
			if (tilePower == Powers.StartPoint)
				Instantiate(playerPref,transform.position,Quaternion.identity,null);
		}
	}
}