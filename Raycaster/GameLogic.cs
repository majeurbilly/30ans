namespace Raycaster;

public static class GameLogic
{
    public static bool AdvanceSurvival(ref float survivalTimer, ref int score, float deltaTimeSeconds)
    {
        if (deltaTimeSeconds <= 0f)
            return false;

        survivalTimer += deltaTimeSeconds;

        int gained = (int)(survivalTimer / 1.0f);
        if (gained <= 0)
            return false;

        score += gained;
        survivalTimer -= gained * 1.0f;
        return true;
    }

    public static bool TryPickupKnife(ref bool hasKnife, ref bool isKnifeSpawned, float distanceToKnife, float pickupThreshold)
    {
        if (!isKnifeSpawned || distanceToKnife >= pickupThreshold)
            return false;
        hasKnife = true;
        isKnifeSpawned = false;
        return true;
    }

    public static bool TryUseKnife(ref bool hasKnife, bool isAttackInputPressed)
    {
        if (!hasKnife || !isAttackInputPressed)
            return false;
        hasKnife = false;
        return true;
    }

    public static bool ResolveGhostCollision(ref bool isGameOver, ref int score, bool hasKnife, float distanceToGhost, float collisionThreshold)
    {
        if (distanceToGhost >= collisionThreshold)
            return false;

        if (hasKnife)
        {
            score += 1000;
            return true;
        }

        isGameOver = true;
        return false;
    }
}

