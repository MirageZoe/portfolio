using UnityEngine;
using UnityEngine.Tilemaps;

/// <summary>
/// Just a simple scriptable object to store some basic data about the
/// tile type
/// </summary>

[CreateAssetMenu]
public class TileData : ScriptableObject
{
	public TileBase[] tiles;

	public bool isThisStartNode = false;
	public bool isThisEndNode = false;
	public bool isThisSlowNode = false;
	public bool isThisPortalNode = false;
	public bool isThisNailsNode = false;
	public bool isThisCheese = false;

	// public float slowAmount = 0;
	// public float sleepAmount = 0;
	public float tileDataPowerAmount = 0;

	public int portalCode = 0;
	public float portalCooldown = 0;
	public float portalChannelTime = 0;
	public GameObject portalRef;
}
