using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;

public struct portalQueue
{
	public int portalCodeQ;
	public bool linked;
	public TileData portalData;
	public WorldTile tileData;
	public GameObject portalRefGO;
}

public class GridCreator : MonoBehaviour
{
	public static GridCreator instance;

	public Grid gridBase;					// grid object containing all the tilemaps
	public Tilemap walkableFloor;			// walkable tilemap
	public Tilemap powerFloor;				// powers tilemap
	public List<Tilemap> obstacleLayers;	// all layers that contain objects to navigate around
	public GameObject tileParentObject;		// where the generated tiles will be stored
	public GameObject nodePrefab;           // world tile prefab
	public GameObject _highlight;           // highlight tile prefab
	public GameObject _playerPref;          // player prefab

	//these are the bounds of where we are searching in the world for tiles, have to use world coords to check for tiles in the tile map
	public int scanStartX = -300, scanStartY = -300, scanFinishX = 300, scanFinishY = 300; 
	private int	_gridSizeX, _gridSizeY;

	private List<GameObject> _unsortedNodes = new List<GameObject>();   // all the nodes in the world
	public GameObject[,] nodes;           // sorted 2d array of nodes, may contain null entries if the map is of an odd shape e.g. gaps
	private int _gridBoundX = 0, _gridBoundY = 0;

	[SerializeField]
	private Color _walkableColor = Color.blue;
	[SerializeField]
	private Color _nonWalkableColor = Color.red;

	//mapping our the start and end nodes
	[SerializeField]
	private WorldTile _startNode = null;
	[SerializeField]
	private WorldTile _endNode = null;
	private Dictionary<TileBase, TileData> _dataFromTiles;
	private Dictionary<int,portalQueue> portalsCreated = new Dictionary<int,portalQueue>();
	public List<TileData> tileDataTypes = new List<TileData>();


	//Awake is called before start
	void Awake()
	{
		instance = this;
		_gridSizeX = Mathf.Abs(scanStartX) + Mathf.Abs(scanFinishX);
		_gridSizeY = Mathf.Abs(scanStartY) + Mathf.Abs(scanFinishY);

		ComputeNodeTypes();
		CreateGrid();
	}

	private void Start() {
		List<Enemy> myEnemies = new List<Enemy>(GameObject.FindObjectsOfType<Enemy>());

		_startNode.SpawnThePlayer();

		foreach (var enemy in myEnemies)
		{
			enemy.myPlayer = GameObject.FindObjectOfType<PlayerMovement>().gameObject;
			GameAssets.i.listOfEnemies.Add(enemy);
		}
	}

	void CreateGrid()
	{
		int gridX = 0, gridY = 0;
		bool foundTileOnLastPass = false;
		for (int x = scanStartX; x < scanFinishX; x++)
		{
			for (int y = scanStartY; y < scanFinishY; y++)
			{
				TileBase tb = walkableFloor.GetTile(new Vector3Int(x, y, 0));
				TileBase tb_p = powerFloor.GetTile(new Vector3Int(x, y, 0));
				if (tb != null)
				{
					bool foundObstacle = false;
					foreach (Tilemap t in obstacleLayers)
					{
						// Debug.Log("[GridCreator]: Checked x:"+x+" y:"+y+" if it's a obstacle");
						TileBase tb2 = t.GetTile(new Vector3Int(x, y, 0));
						if (tb2 != null)
						{
							foundObstacle = true;
						}
					}

					Vector3 worldPosition = new Vector3(x + 0.5f + gridBase.transform.position.x, y + 0.5f + gridBase.transform.position.y, 2);
					GameObject node = (GameObject)Instantiate(nodePrefab, worldPosition, Quaternion.Euler(0, 0, 0));
					GameObject node_highlight = (GameObject)Instantiate(_highlight, worldPosition, Quaternion.Euler(0, 0, 0));
					Vector3Int cellPosition = walkableFloor.WorldToCell(worldPosition);
					WorldTile wt = node.GetComponent<WorldTile>();
					wt.gridX = gridX; wt.gridY = gridY; wt.cellX = cellPosition.x; wt.cellY = cellPosition.y;
					node.transform.parent = tileParentObject.transform;
					node_highlight.transform.parent = node.transform;
					node_highlight.SetActive(false);
					wt._highlight = node_highlight;

					if (_dataFromTiles[tb].isThisStartNode)
					{
						_startNode = wt;
						// assigning script to move player
					}
					if (_dataFromTiles[tb].isThisEndNode)
					{
						_endNode = wt;
					}

					if (tb_p != null)
					{
						// AudioSource currentNodeAudio = node.AddComponent<AudioSource>();
						// currentNodeAudio.playOnAwake = false;
						if (_dataFromTiles[tb_p].isThisSlowNode) 
						{
							wt.tilePower = Powers.Slow;
							wt.powerAmount = _dataFromTiles[tb_p].tileDataPowerAmount;
							// currentNodeAudio.clip = clipSlow;
						}

						if (_dataFromTiles[tb_p].isThisNailsNode)
						{
							wt.tilePower = Powers.Nail;
							wt.powerAmount = _dataFromTiles[tb_p].tileDataPowerAmount;
							// currentNodeAudio.clip = clipSlow;
						}

						if (_dataFromTiles[tb_p].isThisCheese)
						{
							wt.tilePower = Powers.Cheese;
							wt.powerAmount = _dataFromTiles[tb_p].tileDataPowerAmount;
							// currentNodeAudio.clip = clipCheese;
							// currentNodeAudio.volume = 0.5f;
						}
						
						if (_dataFromTiles[tb_p].isThisStartNode)
						{
							wt.tilePower = Powers.StartPoint;
							wt.playerPref = _playerPref;
							_startNode = wt;
						}
						
						if (_dataFromTiles[tb_p].isThisEndNode)
						{
							wt.tilePower = Powers.EndPoint;
							_endNode = wt;
						}
						
						if (_dataFromTiles[tb_p].isThisPortalNode) 
						{
							// set the settings for portal to work
							wt.tilePower = Powers.Portal;
							wt.powerAmount = _dataFromTiles[tb_p].portalCooldown;
							wt.portalChannelTime = _dataFromTiles[tb_p].portalChannelTime;
							wt.portalRefWT = _dataFromTiles[tb_p].portalRef;

							// create a new queue obj of a portal. 
							portalQueue newPortal = new portalQueue();
							newPortal.portalCodeQ = _dataFromTiles[tb_p].portalCode;
							newPortal.linked = false;
							newPortal.portalData = _dataFromTiles[tb_p];
							newPortal.tileData = wt;
							newPortal.portalRefGO = node;

							//Debug.Log(newPortal.portalCodeQ);

							// if it's the first portal of it's kind, add to the queue.
							if (!portalsCreated.ContainsKey(newPortal.portalCodeQ)) {
								portalsCreated.Add(newPortal.portalCodeQ,newPortal);
								// currentNodeAudio.clip = clipTeleport;
							}

							// if it's not, link them.
							if (portalsCreated.ContainsKey(newPortal.portalCodeQ) && portalsCreated[newPortal.portalCodeQ].linked == false) {
								portalQueue firstPortal = portalsCreated[newPortal.portalCodeQ];

								// set the referece of first portal to the 2nd portal
								wt.portalRefWT = firstPortal.tileData.gameObject;

								// set the reference of 2nd portal to the 1st portal
								firstPortal.portalRefGO.GetComponent<WorldTile>().portalRefWT = node;

								// finish wrapping this around
								firstPortal.linked = true;
								// add the sound hopefully to the second portal :)
								// currentNodeAudio.clip = clipTeleport;

							}
						}
					}

					if (!foundObstacle)
					{
						foundTileOnLastPass = true;
						node.name = $"Walkable(power:{wt.tilePower})_" + gridX.ToString() + "_" + gridY.ToString();
						//  node.GetComponent<SpriteRenderer>().color = _walkableColor;
						// Debug.Log("Tile["+node.transform.position.x+"|"+node.transform.position.y+"]: walkable");
					}
					else
					{
						foundTileOnLastPass = true;
						node.name = "NonWalkable_" + gridX.ToString() + "_" + gridY.ToString();
						wt.walkable = false;
						//  node.GetComponent<SpriteRenderer>().color = _nonWalkableColor;
						// Debug.Log("Tile["+node.transform.position.x+"|"+node.transform.position.y+"]: NonWalkable");
					}

					_unsortedNodes.Add(node);

					gridY++;
					if (gridX > _gridBoundX)
						_gridBoundX = gridX;

					if (gridY > _gridBoundY)
						_gridBoundY = gridY;
				}
			}

			if (foundTileOnLastPass)
			{
				gridX++;
				gridY = 0;
				foundTileOnLastPass = false;
			}
		}

		nodes = new GameObject[_gridBoundX + 1, _gridBoundY + 1];

		foreach (GameObject g in _unsortedNodes)
		{
			WorldTile wt = g.GetComponent<WorldTile>();
			nodes[wt.gridX, wt.gridY] = g;
		}

		for (int x = 0; x < _gridBoundX; x++)
		{
			for (int y = 0; y < _gridBoundY; y++)
			{
				if (nodes[x, y] != null)
				{
					WorldTile wt = nodes[x, y].GetComponent<WorldTile>();
					// Debug.Log("[GridCreator]Trying to get neighbors at x:"+x+" y:"+y);
					wt.myNeighbours = GetNeighbours(x, y, _gridBoundX, _gridBoundY);
				}
			}
		}
	}

	public List<WorldTile> GetNeighbours(int x, int y, int width, int height)
	{
		List<WorldTile> myNeighbours = new List<WorldTile>();

		if (x > 0 && x < width - 1)
		{
			if (y > 0 && y < height - 1)
			{
				if (nodes[x + 1, y] != null)
				{
					WorldTile wt1 = nodes[x + 1, y].GetComponent<WorldTile>();
					if (wt1 != null) myNeighbours.Add(wt1);
				}

				if (nodes[x - 1, y] != null)
				{
					WorldTile wt2 = nodes[x - 1, y].GetComponent<WorldTile>();
					if (wt2 != null) myNeighbours.Add(wt2);
				}

				if (nodes[x, y + 1] != null)
				{
					WorldTile wt3 = nodes[x, y + 1].GetComponent<WorldTile>();
					if (wt3 != null) myNeighbours.Add(wt3);
				}

				if (nodes[x, y - 1] != null)
				{
					WorldTile wt4 = nodes[x, y - 1].GetComponent<WorldTile>();
					if (wt4 != null) myNeighbours.Add(wt4);
				}
			}
			else if (y == 0)
			{
				if (nodes[x + 1, y] != null)
				{
					WorldTile wt1 = nodes[x + 1, y].GetComponent<WorldTile>();
					if (wt1 != null) myNeighbours.Add(wt1);
				}

				if (nodes[x - 1, y] != null)
				{
					WorldTile wt2 = nodes[x - 1, y].GetComponent<WorldTile>();
					if (wt2 != null) myNeighbours.Add(wt2);
				}
				
				// Debug.Log("getting neighbor where y == 0 & nodes[x, y+1] == null");
				if (nodes[x, y + 1] != null)// this was ==, not !=
				{
					WorldTile wt3 = nodes[x, y + 1].GetComponent<WorldTile>();
					if (wt3 != null) myNeighbours.Add(wt3);
				}
			}
			else if (y == height - 1)
			{
				if (nodes[x, y - 1] != null)
				{
					WorldTile wt4 = nodes[x, y - 1].GetComponent<WorldTile>();
					if (wt4 != null) myNeighbours.Add(wt4);
				}
				if (nodes[x + 1, y] != null)
				{
					WorldTile wt1 = nodes[x + 1, y].GetComponent<WorldTile>();
					if (wt1 != null) myNeighbours.Add(wt1);
				}

				if (nodes[x - 1, y] != null)
				{
					WorldTile wt2 = nodes[x - 1, y].GetComponent<WorldTile>();
					if (wt2 != null) myNeighbours.Add(wt2);
				}
			}
		}
		else if (x == 0)
		{
			if (y > 0 && y < height - 1)
			{
				if (nodes[x + 1, y] != null)
				{
					WorldTile wt1 = nodes[x + 1, y].GetComponent<WorldTile>();
					if (wt1 != null) myNeighbours.Add(wt1);
				}

				if (nodes[x, y - 1] != null)
				{
					WorldTile wt4 = nodes[x, y - 1].GetComponent<WorldTile>();
					if (wt4 != null) myNeighbours.Add(wt4);
				}

				if (nodes[x, y + 1] != null)
				{
					WorldTile wt3 = nodes[x, y + 1].GetComponent<WorldTile>();
					if (wt3 != null) myNeighbours.Add(wt3);
				}
			}
			else if (y == 0)
			{
				if (nodes[x + 1, y] != null)
				{
					WorldTile wt1 = nodes[x + 1, y].GetComponent<WorldTile>();
					if (wt1 != null) myNeighbours.Add(wt1);
				}

				if (nodes[x, y + 1] != null)
				{
					WorldTile wt3 = nodes[x, y + 1].GetComponent<WorldTile>();
					if (wt3 != null) myNeighbours.Add(wt3);
				}
			}
			else if (y == height - 1)
			{
				if (nodes[x + 1, y] != null)
				{
					WorldTile wt1 = nodes[x + 1, y].GetComponent<WorldTile>();
					if (wt1 != null) myNeighbours.Add(wt1);
				}

				if (nodes[x, y - 1] != null)
				{
					WorldTile wt4 = nodes[x, y - 1].GetComponent<WorldTile>();
					if (wt4 != null) myNeighbours.Add(wt4);
				}
			}
		}
		else if (x == width - 1)
		{
			if (y > 0 && y < height - 1)
			{
				if (nodes[x - 1, y] != null)
				{
					WorldTile wt2 = nodes[x - 1, y].GetComponent<WorldTile>();
					if (wt2 != null) myNeighbours.Add(wt2);
				}

				if (nodes[x, y + 1] != null)
				{
					WorldTile wt3 = nodes[x, y + 1].GetComponent<WorldTile>();
					if (wt3 != null) myNeighbours.Add(wt3);
				}

				if (nodes[x, y - 1] != null)
				{
					WorldTile wt4 = nodes[x, y - 1].GetComponent<WorldTile>();
					if (wt4 != null) myNeighbours.Add(wt4);
				}
			}
			else if (y == 0)
			{
				if (nodes[x - 1, y] != null)
				{
					WorldTile wt2 = nodes[x - 1, y].GetComponent<WorldTile>();
					if (wt2 != null) myNeighbours.Add(wt2);
				}
				if (nodes[x, y + 1] != null)
				{
					WorldTile wt3 = nodes[x, y + 1].GetComponent<WorldTile>();
					if (wt3 != null) myNeighbours.Add(wt3);
				}
			}
			else if (y == height - 1)
			{
				if (nodes[x - 1, y] != null)
				{
					WorldTile wt2 = nodes[x - 1, y].GetComponent<WorldTile>();
					if (wt2 != null) myNeighbours.Add(wt2);
				}

				if (nodes[x, y - 1] != null)
				{
					WorldTile wt4 = nodes[x, y - 1].GetComponent<WorldTile>();
					if (wt4 != null) myNeighbours.Add(wt4);
				}
			}
		}

		return myNeighbours;
	}

	private void ComputeNodeTypes()
	{
		//updating the dictionary
		_dataFromTiles = new Dictionary<TileBase, TileData>();

		foreach (TileData tileData in tileDataTypes)
		{
			foreach (TileBase tile in tileData.tiles)
			{
				_dataFromTiles.Add(tile,tileData);
			}
		}
	}

	public WorldTile GetStartNode()
	{
		return _startNode;
	}

	public WorldTile GetEndNode()
	{
		return _endNode;
	}

	public WorldTile GetTileFromCoordinates(Vector2 coords) 
	{
		WorldTile theTile = null;
		//Debug.Log($"coords received: {coords}");
		Vector3Int lPos = gridBase.WorldToCell(coords);
		//Debug.Log($"coords found: {lPos};");
		// WorldTile theTile = nodes[lPos.x,lPos.y].GetComponent<WorldTile>();
		// Debug.Log($"{theTile.name}");
		for (int i = 0; i < nodes.GetLength(0); i++)
			for (int ii = 0; ii < nodes.GetLength(1)-1; ii++)
			{
				// Debug.Log($"[GetTile]: checking {i} {ii}");
				int xVal = nodes[i,ii].GetComponent<WorldTile>().cellX;
				int yVal = nodes[i,ii].GetComponent<WorldTile>().cellY;
				if (xVal == lPos.x && yVal == lPos.y) {
					theTile = nodes[i,ii].GetComponent<WorldTile>();
					//Debug.Log($"Found object! It's name is: {nodes[i,ii].name}");
				}
			}
		return theTile;
	}
	
	static bool RoughlyEqual(float a, float b) {
        float treshold = .5f; //how much roughly
        return (Mathf.Abs(a-b)< treshold);
    }

	public void testing(Vector3 coords)
	{
		Debug.Log("received: "+coords);
		Vector3Int lPos = gridBase.WorldToCell(coords);
		Debug.Log("the Pos of Tile:"+lPos);
	}
}

