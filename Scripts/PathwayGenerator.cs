using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PathwayGenerator : MonoBehaviour
{
	[SerializeField]
	private A_Star_Pathfinding _pathfindingAlgorithm = null;
	[SerializeField]
	private GridCreator _gridCreator = null;
	[SerializeField]
	private Color _correctColor;
	private List<WorldTile> _path;

	public void ShowPath()
	{
		WorldTile startNode = _gridCreator.GetStartNode();
		WorldTile endNode = _gridCreator.GetEndNode();

		_path = _pathfindingAlgorithm.RunAlgorithm(startNode,endNode);

		foreach(WorldTile tile in _path)
		{
			tile.gameObject.GetComponent<SpriteRenderer>().color = _correctColor;
		}
	}

	private void Start()
	{
		// ShowPath();
	}
}
