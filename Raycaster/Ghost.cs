using SFML.Graphics;
using SFML.System;
using SFML.Window;

namespace Raycaster
{
    public class Ghost
    {
        public Vector2f Position { get; set; }
        private CircleShape shape;

        public float Speed { get; set; } = 35f;
        private List<Vector2i> currentPath = new List<Vector2i>();
        private float pathRecalculationTimer = 0f;

        public Ghost(Vector2f position)
        {
            Position = position;
            shape = new CircleShape(4f);
            shape.FillColor = Color.Red;
            shape.Origin = new Vector2f(4f, 4f);
        }

        public void Update(float deltaTime, Map map, Vector2f targetPosition)
        {
            pathRecalculationTimer += deltaTime;

            if (pathRecalculationTimer >= 0.5f || currentPath.Count == 0)
            {
                Vector2i startCell = new Vector2i(
                    (int)(Position.X / Tile.TILESIZE_X),
                    (int)(Position.Y / Tile.TILESIZE_Y)
                );
                Vector2i targetCell = new Vector2i(
                    (int)(targetPosition.X / Tile.TILESIZE_X),
                    (int)(targetPosition.Y / Tile.TILESIZE_Y)
                );
                currentPath = ComputePathBFS(map, startCell, targetCell);
                pathRecalculationTimer = 0f;
            }

            if (currentPath.Count > 0)
            {
                Vector2i firstNode = currentPath[0];
                float centerX = (firstNode.X + 0.5f) * Tile.TILESIZE_X;
                float centerY = (firstNode.Y + 0.5f) * Tile.TILESIZE_Y;
                Vector2f center = new Vector2f(centerX, centerY);

                float dx = center.X - Position.X;
                float dy = center.Y - Position.Y;
                float dist = MathF.Sqrt(dx * dx + dy * dy);

                if (dist < 2f)
                {
                    currentPath.RemoveAt(0);
                }
                else if (dist > 1e-5f)
                {
                    float move = Speed * deltaTime;
                    float nx = Position.X + (dx / dist) * move;
                    float ny = Position.Y + (dy / dist) * move;
                    Position = new Vector2f(nx, ny);
                }
            }
        }

        private List<Vector2i> ComputePathBFS(Map map, Vector2i start, Vector2i end)
        {
            int rows = map.Size.X;
            int cols = map.Size.Y;
            if (start.X < 0 || start.X >= rows || start.Y < 0 || start.Y >= cols)
                return new List<Vector2i>();
            if (map.WorldMap[start.X, start.Y] != 0)
                return new List<Vector2i>();
            if (end.X < 0 || end.X >= rows || end.Y < 0 || end.Y >= cols)
                return new List<Vector2i>();
            if (map.WorldMap[end.X, end.Y] != 0)
                return new List<Vector2i>();
            if (start.X == end.X && start.Y == end.Y)
                return new List<Vector2i>();

            Queue<Vector2i> queue = new Queue<Vector2i>();
            Dictionary<Vector2i, Vector2i> parent = new Dictionary<Vector2i, Vector2i>();
            queue.Enqueue(start);
            parent[start] = start;

            int[] dX = { -1, 1, 0, 0 };
            int[] dY = { 0, 0, -1, 1 };

            while (queue.Count > 0)
            {
                Vector2i cur = queue.Dequeue();
                if (cur.X == end.X && cur.Y == end.Y)
                    break;

                for (int i = 0; i < 4; i++)
                {
                    int nx = cur.X + dX[i];
                    int ny = cur.Y + dY[i];
                    if (nx < 0 || nx >= rows || ny < 0 || ny >= cols)
                        continue;
                    if (map.WorldMap[nx, ny] != 0)
                        continue;
                    Vector2i next = new Vector2i(nx, ny);
                    if (parent.ContainsKey(next))
                        continue;
                    parent[next] = cur;
                    queue.Enqueue(next);
                }
            }

            if (!parent.ContainsKey(end))
                return new List<Vector2i>();

            List<Vector2i> pathReversed = new List<Vector2i>();
            Vector2i p = end;
            while (p.X != start.X || p.Y != start.Y)
            {
                pathReversed.Add(p);
                p = parent[p];
            }
            pathReversed.Reverse();
            return pathReversed;
        }

        public void DrawOnMinimap(RenderWindow window)
        {
            shape.Position = Position;
            window.Draw(shape);
        }
    }
}
