using SFML.System;
using SFML.Graphics;

namespace Raycaster
{
    public class Map
    {
        List<Tile> Tiles { get; set; }
        public int[,] WorldMap = new int[,]
        {
            {2, 3, 3, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2},
            {2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2},
            {2, 0, 2, 2, 0, 2, 0, 2, 2, 2, 2, 0, 2, 0, 2, 2, 2, 2, 0, 3},
            {3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 3},
            {3, 0, 2, 0, 2, 2, 2, 3, 3, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 2},
            {2, 0, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 0, 2},
            {2, 0, 3, 0, 2, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2},
            {2, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 2},
            {2, 0, 0, 0, 2, 0, 2, 0, 2, 2, 2, 0, 2, 0, 0, 0, 0, 2, 0, 3},
            {2, 2, 2, 2, 2, 0, 2, 0, 2, 0, 2, 0, 3, 0, 2, 2, 0, 2, 0, 3},
            {3, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 3, 0, 2, 0, 0, 2, 0, 2},
            {3, 0, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 0, 2, 2, 0, 2},
            {2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 2},
            {2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 0, 2, 2, 2, 2, 2, 2},
            {2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2},
            {2, 0, 2, 0, 3, 3, 3, 3, 3, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 3},
            {3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 3},
            {3, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 0, 2, 0, 2},
            {2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2},
            {2, 2, 2, 3, 3, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 3, 3, 2, 2}
        };
        private Vector2i size;
        public Vector2i Size
        {
            get { return size; }
            set { size = value; }
        }
        public Map()
        {
            this.Tiles = new List<Tile>();
            Size = new Vector2i(WorldMap.GetLength(0), WorldMap.GetLength(1));
            CreateMinimap();
            
        }

        public Vector2f GetRandomEmptyPosition(Random rng)
        {
            if (rng == null) throw new ArgumentNullException(nameof(rng));

            int width = Size.X;
            int height = Size.Y;
            if (width <= 0 || height <= 0)
                throw new InvalidOperationException("Map size is invalid.");

            // Rejection sampling, then fallback to a scan in the unlikely case the map is nearly full.
            for (int attempts = 0; attempts < 10_000; attempts++)
            {
                int x = rng.Next(0, width);
                int y = rng.Next(0, height);
                if (WorldMap[x, y] == 0)
                {
                    return new Vector2f(
                        (x + 0.5f) * Tile.TILESIZE_X,
                        (y + 0.5f) * Tile.TILESIZE_Y
                    );
                }
            }

            for (int x = 0; x < width; x++)
            {
                for (int y = 0; y < height; y++)
                {
                    if (WorldMap[x, y] == 0)
                    {
                        return new Vector2f(
                            (x + 0.5f) * Tile.TILESIZE_X,
                            (y + 0.5f) * Tile.TILESIZE_Y
                        );
                    }
                }
            }

            throw new InvalidOperationException("No empty (0) cell exists in the map.");
        }

        public bool IsWallCell(int cellX, int cellY)
        {
            if (cellX < 0 || cellY < 0 || cellX >= Size.X || cellY >= Size.Y)
                return true;
            return WorldMap[cellX, cellY] != 0;
        }

        public bool IsWallAt(float worldX, float worldY)
        {
            int cellX = (int)(worldX / Tile.TILESIZE_X);
            int cellY = (int)(worldY / Tile.TILESIZE_Y);
            return IsWallCell(cellX, cellY);
        }
        public void CreateMinimap()
        {
            for (int i = 0; i < Size.X; i++)
            {
                for (int j = 0; j < Size.Y; j++)
                {
                    Color color = Color.Black;
                    if (WorldMap[i, j] != 0)
                        color = Color.Red;
                    Tile tile = new Tile(new Vector2f(i, j), color);
                    Tiles.Add(tile);
                }
            }
        }
        public void DrawMinimap(RenderWindow window)
        {
            foreach (Tile tile in Tiles)
            {
                window.Draw(tile.Shape);
            }
            for (int i = 0; i < 8; i++)
            {
                Vertex[] line = {
                    new Vertex(new Vector2f(0, i * Tile.TILESIZE_Y), new Color(64, 64, 64, 255)),
                    new Vertex(new Vector2f(512, i * Tile.TILESIZE_Y), new Color(64, 64, 64, 255))
                };
                Vertex[] column = {
                    new Vertex(new Vector2f(i * Tile.TILESIZE_X, 0), new Color(64, 64, 64, 255)),
                    new Vertex(new Vector2f(i * Tile.TILESIZE_X, 512), new Color(64, 64, 64, 255))
                };
                window.Draw(line, PrimitiveType.Lines);
                window.Draw(column, PrimitiveType.Lines);
            }
        }
    }
}
