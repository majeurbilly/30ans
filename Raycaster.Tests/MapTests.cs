using SFML.System;
using Xunit;

namespace Raycaster.Tests;

public class MapTests
{
    [Fact]
    public void CalculateDistance_3_4_5_Triangle_IsCorrect()
    {
        Vector2f a = new Vector2f(0f, 0f);
        Vector2f b = new Vector2f(3f, 4f);

        float d = Raycaster.MathUtils.CalculateDistance(a, b);

        Assert.Equal(5f, d, precision: 5);
    }

    [Fact]
    public void Map_WorldMap_HasExpectedDimensions_20x20()
    {
        Raycaster.Map map = new Raycaster.Map();

        Assert.Equal(20, map.WorldMap.GetLength(0));
        Assert.Equal(20, map.WorldMap.GetLength(1));
        Assert.Equal(20, map.Size.X);
        Assert.Equal(20, map.Size.Y);
    }

    [Fact]
    public void IsWallCell_OutOfBounds_IsTreatedAsWall()
    {
        Raycaster.Map map = new Raycaster.Map();

        Assert.True(map.IsWallCell(-1, 0));
        Assert.True(map.IsWallCell(0, -1));
        Assert.True(map.IsWallCell(map.Size.X, 0));
        Assert.True(map.IsWallCell(0, map.Size.Y));
    }
}

