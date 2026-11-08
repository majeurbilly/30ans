using SFML.System;

namespace Raycaster;

public static class MathUtils
{
    public static float CalculateDistance(Vector2f a, Vector2f b)
    {
        float dx = b.X - a.X;
        float dy = b.Y - a.Y;
        return MathF.Sqrt(dx * dx + dy * dy);
    }
}

