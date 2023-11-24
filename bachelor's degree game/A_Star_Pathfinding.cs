using System.Collections.Generic;
using UnityEngine;

public class A_Star_Pathfinding : MonoBehaviour
{
	private WorldTile _startNode;
	private WorldTile _endNode;

	public List<WorldTile> RunAlgorithm(WorldTile pStartNode, WorldTile pEndNode)
	{
		_startNode = pStartNode;
		_endNode = pEndNode;
		return GetPath();
	}

	List<WorldTile> RetracePath(WorldTile pStartNode, WorldTile pTargetNode)
	{
		List<WorldTile> path = new List<WorldTile>();
		WorldTile currentNode = pTargetNode;

		while (currentNode != pStartNode)
		{
			path.Add(currentNode);
			currentNode = currentNode.parent;
		}

		//to include start node as well
		path.Add(currentNode);

		path.Reverse();
		return path;
	}

	int GetDistance(WorldTile pNodeA, WorldTile pNodeB)
	{
		int dstX = Mathf.Abs(pNodeA.gridX - pNodeB.gridX);
		int dstY = Mathf.Abs(pNodeA.gridY - pNodeB.gridY);

		if (dstX > dstY)
			return 14 * dstY + 10 * (dstX - dstY);
		return 14 * dstX + 10 * (dstY - dstX);
	}

	private List<WorldTile> GetPath()
	{
		List<WorldTile> openSet = new List<WorldTile>();
		HashSet<WorldTile> closedSet = new HashSet<WorldTile>();
		openSet.Add(_startNode);

		while (openSet.Count > 0) // to change to if statement for step-by-step
		{
			WorldTile currentNode = openSet[0];
			for (int i = 1; i < openSet.Count; i++)
			{
				if (openSet[i].fCost < currentNode.fCost || 
					openSet[i].fCost == currentNode.fCost && openSet[i].hCost < currentNode.hCost)
				{
					currentNode = openSet[i];
				}
			}

			openSet.Remove(currentNode);
			closedSet.Add(currentNode);

			if (currentNode == _endNode)
			{
				List<WorldTile> correctPath = RetracePath(_startNode, _endNode);
				return correctPath;
			}

			foreach (WorldTile neighbour in currentNode.myNeighbours)
			{
				if (!neighbour.walkable || closedSet.Contains(neighbour))
				{
					continue;
				}
				int newMovementCostToNeighbour = currentNode.gCost + GetDistance(currentNode, neighbour);
				if (newMovementCostToNeighbour < neighbour.gCost || !openSet.Contains(neighbour))
				{
					neighbour.gCost = newMovementCostToNeighbour;
					neighbour.hCost = GetDistance(neighbour, _endNode);
					neighbour.parent = currentNode;

					if (!openSet.Contains(neighbour))
						openSet.Add(neighbour);
				}
			}
		}

		Debug.Log("Correct path does not exist");
		return new List<WorldTile>();
	}
}
