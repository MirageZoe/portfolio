using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Flags]
public enum Powers
{
    None = 0,
    Slow = 1,
    Nail = 2,
    Portal = 4,
    Cheese = 8,
    StartPoint = 16,
    EndPoint = 32,
};
