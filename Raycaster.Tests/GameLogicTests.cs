using Xunit;

namespace Raycaster.Tests;

public class GameLogicTests
{
    [Fact]
    public void TryPickupKnife_Succeeds_WhenDistanceValidAndKnifePresent()
    {
        bool hasKnife = false;
        bool isKnifeSpawned = true;
        float distanceToKnife = 10f;
        float pickupThreshold = 32f;

        bool result = Raycaster.GameLogic.TryPickupKnife(ref hasKnife, ref isKnifeSpawned, distanceToKnife, pickupThreshold);

        Assert.True(result);
        Assert.True(hasKnife);
        Assert.False(isKnifeSpawned);
    }

    [Fact]
    public void TryPickupKnife_Fails_WhenDistanceTooLarge()
    {
        bool hasKnife = false;
        bool isKnifeSpawned = true;
        float distanceToKnife = 100f;
        float pickupThreshold = 32f;

        bool result = Raycaster.GameLogic.TryPickupKnife(ref hasKnife, ref isKnifeSpawned, distanceToKnife, pickupThreshold);

        Assert.False(result);
        Assert.False(hasKnife);
        Assert.True(isKnifeSpawned);
    }

    [Fact]
    public void TryUseKnife_Succeeds_WhenPlayerHasKnifeAndInputPressed()
    {
        bool hasKnife = true;
        bool isAttackInputPressed = true;

        bool result = Raycaster.GameLogic.TryUseKnife(ref hasKnife, isAttackInputPressed);

        Assert.True(result);
        Assert.False(hasKnife);
    }

    [Fact]
    public void TryUseKnife_Fails_WhenInputPressedButPlayerHasNoKnife()
    {
        bool hasKnife = false;
        bool isAttackInputPressed = true;

        bool result = Raycaster.GameLogic.TryUseKnife(ref hasKnife, isAttackInputPressed);

        Assert.False(result);
        Assert.False(hasKnife);
    }

    [Fact]
    public void ResolveGhostCollision_NoEffect_WhenDistanceTooLarge()
    {
        bool isGameOver = false;
        int score = 500;
        float distanceToGhost = 100f;
        float collisionThreshold = 50f;

        bool result = Raycaster.GameLogic.ResolveGhostCollision(ref isGameOver, ref score, false, distanceToGhost, collisionThreshold);

        Assert.False(result);
        Assert.False(isGameOver);
        Assert.Equal(500, score);
    }

    [Fact]
    public void ResolveGhostCollision_PlayerDies_WhenDistanceShortAndNoAttack()
    {
        bool isGameOver = false;
        int score = 200;
        bool hasKnife = false; // n'a pas attaqué ce tour
        float distanceToGhost = 10f;
        float collisionThreshold = 50f;

        bool result = Raycaster.GameLogic.ResolveGhostCollision(ref isGameOver, ref score, hasKnife, distanceToGhost, collisionThreshold);

        Assert.False(result);
        Assert.True(isGameOver);
        Assert.Equal(200, score);
    }

    [Fact]
    public void ResolveGhostCollision_GhostKilled_WhenDistanceShortAndPlayerAttacked()
    {
        bool isGameOver = false;
        int score = 300;
        bool hasKnife = true; // a utilisé le couteau ce tour (fantôme tué)
        float distanceToGhost = 10f;
        float collisionThreshold = 50f;

        bool result = Raycaster.GameLogic.ResolveGhostCollision(ref isGameOver, ref score, hasKnife, distanceToGhost, collisionThreshold);

        Assert.True(result);
        Assert.False(isGameOver);
        Assert.Equal(1300, score);
    }
}
