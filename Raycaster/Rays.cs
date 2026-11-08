using SFML.Graphics;
using SFML.System;
using SFML.Window;
using System.Collections.Generic;


namespace Raycaster
{
    public static class Rays
    {
        /// <summary>Distance perpendiculaire du mur pour chaque rayon (index = colonne écran). Utilisé pour le sprite casting.</summary>
        public static float[] ZBuffer = new float[Program.SCREEN_WIDTH];

        private static float fov = 1.0472f;
        private static float halfFov = fov / 2f;
        private static float increment = fov / Program.SCREEN_WIDTH;
        private static int halfScreen = Program.SCREEN_HEIGHT / 2;
        private static int maxSteps = 8;
        private static float twoPi = MathF.PI * 2f;
        private static float halfThreePi = (3f * MathF.PI) / 2f;
        private static float halfPi = MathF.PI / 2f;
        private const float TEXTURE_SIZE_X = 512f;
        private const float TEXTURE_SIZE_Y = 512f;
        private static Color skyColor = new Color(135, 106, 235, 255);
        private static Color groundColor = new Color(64, 64, 64);

        public static float GetDistance(Vector2f initPos, Vector2f endPos)
        {
            return MathF.Sqrt(MathF.Pow(endPos.X - initPos.X, 2f) + MathF.Pow(endPos.Y - initPos.Y, 2f));
        }
        public static Vector2f GetRayXHit(Vector2f playerPos, float angle, Map map)
        {
            float rayAngle = angle;
            float perpendicularSlope = -1 / MathF.Tan(rayAngle);

            Vector2f rayPos = new Vector2f();
            Vector2f rayOffset = new Vector2f();
            Vector2i mapCoords = new Vector2i();

            if (rayAngle > MathF.PI)
            {
                rayPos.Y = (((int)(playerPos.Y) / Tile.TILESIZE_Y) * Tile.TILESIZE_Y) - 0.0001f;
                rayPos.X = (playerPos.Y - rayPos.Y) * perpendicularSlope + playerPos.X;

                rayOffset.Y = -Tile.TILESIZE_Y;
                rayOffset.X = -(rayOffset.Y) * perpendicularSlope;
            }
            else if (rayAngle < MathF.PI)
            {
                rayPos.Y = (((int)(playerPos.Y) / Tile.TILESIZE_Y) * Tile.TILESIZE_Y) + Tile.TILESIZE_Y;
                rayPos.X = (playerPos.Y - rayPos.Y) * perpendicularSlope + playerPos.X;

                rayOffset.Y = Tile.TILESIZE_Y;
                rayOffset.X = -(rayOffset.Y) * perpendicularSlope;
            }
            else if (rayAngle == 0 || rayAngle == MathF.PI)
            {
                rayPos.X = playerPos.X;
                rayPos.Y = playerPos.Y;
            }
            int maxDistance = maxSteps;
            while (maxDistance > 0)
            {
                mapCoords.X = (int)(rayPos.X) / Tile.TILESIZE_Y;
                mapCoords.Y = ((int)(rayPos.Y) / Tile.TILESIZE_Y);

                if (mapCoords.X < 0 || mapCoords.Y < 0 || mapCoords.X > map.Size.X - 1 || mapCoords.Y > map.Size.Y - 1)
                    break;
                if (map.WorldMap[mapCoords.X, mapCoords.Y] != 0)
                {
                    break;
                }
                else
                {
                    rayPos.X += rayOffset.X;
                    rayPos.Y += rayOffset.Y;
                }
                maxDistance--;
            }
            return rayPos;
        }
        public static Vector2f GetRayYHit(Vector2f playerPos, float angle, Map map)
        {
            float rayAngle = angle;
            float perpendicularSlope = -MathF.Tan(rayAngle);

            Vector2f rayPos = new Vector2f();
            Vector2f rayOffset = new Vector2f();
            Vector2i mapCoords = new Vector2i();

            if (rayAngle > halfPi && rayAngle < halfThreePi)
            {
                rayPos.X = (((int)(playerPos.X) / Tile.TILESIZE_X) * Tile.TILESIZE_X) - 0.0001f;
                rayPos.Y = (playerPos.X - rayPos.X) * perpendicularSlope + playerPos.Y;

                rayOffset.X = -Tile.TILESIZE_X;
                rayOffset.Y = -(rayOffset.X) * perpendicularSlope;
            }
            else if (rayAngle < halfPi || rayAngle > halfThreePi)
            {
                rayPos.X = (((int)(playerPos.X) / Tile.TILESIZE_X) * Tile.TILESIZE_X) + Tile.TILESIZE_X;
                rayPos.Y = (playerPos.X - rayPos.X) * perpendicularSlope + playerPos.Y;

                rayOffset.X = Tile.TILESIZE_X;
                rayOffset.Y = -(rayOffset.X) * perpendicularSlope;
            }
            else if (rayAngle == 0 || rayAngle == halfPi)
            {
                rayPos.Y = playerPos.Y;
                rayPos.X = playerPos.Y;
            }
            int maxDistance = maxSteps;
            while (maxDistance > 0)
            {
                mapCoords.X = (int)(rayPos.X) / Tile.TILESIZE_X;
                mapCoords.Y = ((int)(rayPos.Y) / Tile.TILESIZE_X);

                if (mapCoords.X < 0 || mapCoords.Y < 0 || mapCoords.X > map.Size.X - 1 || mapCoords.Y > map.Size.Y - 1)
                    break;
                if (map.WorldMap[mapCoords.X, mapCoords.Y] != 0)
                {
                    break;
                }
                else
                {
                    rayPos.X += rayOffset.X;
                    rayPos.Y += rayOffset.Y;
                }
                maxDistance--;
            }
            return rayPos;

        }
        public static void Draw3DWorld(Player player, RenderWindow window, Map map)
        {
            Color blue = new Color(0, 0, 200, 255);
            for (int rayNum = 0; rayNum < Program.SCREEN_WIDTH; rayNum++)
            {
                float angle = player.Angle - halfFov + rayNum * increment;
                if (angle < 0)
                    angle += MathF.PI * 2f;
                if (angle > MathF.PI * 2f)
                    angle -= MathF.PI * 2f;

                Vector2f rayX = GetRayXHit(player.Position, angle, map);
                Vector2f rayY = GetRayYHit(player.Position, angle, map);

                float distanceX = GetDistance(player.Position, rayX);
                float distanceY = GetDistance(player.Position, rayY);

                float finalDistance = float.MaxValue;

                if (distanceY < distanceX)
                {
                    blue = new Color(0, 0, 100, 255);
                    finalDistance = distanceY;
                }
                if (distanceX < distanceY)
                {
                    finalDistance = distanceX;
                    blue = new Color(0, 0, 150, 255);
                }

                finalDistance = finalDistance * MathF.Cos(angle - player.Angle);

                float wallHeight = MathF.Floor(halfScreen / finalDistance * 25f);


                Vertex[] wallStrip = {
                    new Vertex(new Vector2f(rayNum, halfScreen - wallHeight), blue),
                    new Vertex(new Vector2f(rayNum, halfScreen + wallHeight), blue)
                };
                Vertex[] sky =
                {
                    new Vertex(new Vector2f(rayNum, halfScreen + wallHeight), new Color(135, 106, 125, 255)),
                    new Vertex(new Vector2f(rayNum, 0f), new Color(135, 106, 235, 255))
                };
                Vertex[] floor = {
                    new Vertex(new Vector2f(rayNum, halfScreen + wallHeight), new Color(64, 64, 64)),
                    new Vertex(new Vector2f(rayNum, Program.SCREEN_HEIGHT), new Color(32, 32, 32))
                    };

                window.Draw(sky, PrimitiveType.Lines);
                window.Draw(wallStrip, PrimitiveType.Lines);
                window.Draw(floor, PrimitiveType.Lines);
            }
        }
        public static void Draw3DWorldTextured(Player player, RenderWindow window, Map map, VertexArray wallVA, VertexArray ceilingFloorVA)
        {
            for (int i = 0; i < Program.SCREEN_WIDTH; i++)
                ZBuffer[i] = float.MaxValue;

            for (int rayNum = 0; rayNum < Program.SCREEN_WIDTH; rayNum++)
            {
                float angle = player.Angle - halfFov + rayNum * increment;
                if (angle < 0)
                    angle += twoPi;
                if (angle > twoPi)
                    angle -= twoPi;

                Vector2f rayX = GetRayXHit(player.Position, angle, map);
                Vector2f rayY = GetRayYHit(player.Position, angle, map);
                Vector2f finalPos = new Vector2f();

                float distanceX = GetDistance(player.Position, rayX);
                float distanceY = GetDistance(player.Position, rayY);

                float finalDistance = 0;
                int textureX = 0;
                Color brightness = Color.White;
                if (distanceY < distanceX)
                {
                    finalPos = rayY;
                    finalDistance = distanceY;
                    textureX = (int)(finalPos.Y * (TEXTURE_SIZE_X / Tile.TILESIZE_X) % TEXTURE_SIZE_X);
                }
                if (distanceX < distanceY)
                {
                    finalDistance = distanceX;
                    finalPos = rayX;
                    brightness = new Color(200, 200, 200, 255);
                    textureX = (int)(finalPos.X * (TEXTURE_SIZE_X / Tile.TILESIZE_X) % TEXTURE_SIZE_X);
                }
                Vector2i mapCoords = new Vector2i((int)(finalPos.X) / Tile.TILESIZE_Y, ((int)(finalPos.Y) / Tile.TILESIZE_Y));

                finalDistance = finalDistance * MathF.Cos(angle - player.Angle);
                ZBuffer[rayNum] = finalDistance;

                float wallHeight = MathF.Floor(halfScreen / finalDistance * 100f);
                float groundPixel = (int)(wallHeight + halfScreen);
                float ceilingPixel = (int)(-wallHeight + halfScreen);

                int textureID = map.WorldMap[mapCoords.X, mapCoords.Y] - 1;


                //Wall vertices
                wallVA.Append(new Vertex(
                        position: new Vector2f(rayNum, ceilingPixel),
                        color: brightness,
                        texCoords: new Vector2f(textureX + textureID * TEXTURE_SIZE_X, 0)));

                wallVA.Append(new Vertex(
                        position: new Vector2f(rayNum, groundPixel),
                        color: brightness,
                        texCoords: new Vector2f(textureX + textureID * TEXTURE_SIZE_X, TEXTURE_SIZE_Y)));

                //Floor vertices
                ceilingFloorVA.Append(new Vertex(new Vector2f(rayNum, groundPixel), groundColor));
                ceilingFloorVA.Append(new Vertex(new Vector2f(rayNum, Program.SCREEN_HEIGHT), groundColor));

                //Sky vertices
                ceilingFloorVA.Append(new Vertex(new Vector2f(rayNum, ceilingPixel), skyColor));
                ceilingFloorVA.Append(new Vertex(new Vector2f(rayNum, 0f), skyColor));
            }

        }

        /// <summary>Dessine les sprites en 3D (algorithme type Wolfenstein 3D). Les sprites doivent être triés du plus éloigné au plus proche.</summary>
        public static void DrawSprites3D(RenderWindow window, Player player, List<Vector2f> spritePositions, List<Color> spriteColors)
        {
            if (spritePositions == null || spriteColors == null || spritePositions.Count != spriteColors.Count)
                return;

            Vector2f dir = player.Direction;
            float planeScale = 0.66f;
            Vector2f plane = new Vector2f(-dir.Y * planeScale, dir.X * planeScale);
            float invDet = 1.0f / (plane.X * dir.Y - plane.Y * dir.X);

            for (int i = 0; i < spritePositions.Count; i++)
            {
                Vector2f sprite = spritePositions[i];
                Color color = spriteColors[i];

                float spriteX = sprite.X - player.Position.X;
                float spriteY = sprite.Y - player.Position.Y;

                float transformX = invDet * (dir.Y * spriteX - dir.X * spriteY);
                float transformY = invDet * (-plane.Y * spriteX + plane.X * spriteY);

                if (transformY <= 0)
                    continue;

                int spriteScreenX = (int)((Program.SCREEN_WIDTH / 2f) * (1f + transformX / transformY));
                float spriteHeight = MathF.Abs(Program.SCREEN_HEIGHT / transformY * 100f * 0.5f);
                float spriteWidth = spriteHeight;
                int drawHeight = (int)spriteHeight;
                int drawWidth = (int)spriteWidth;

                int drawStartX = spriteScreenX - drawWidth / 2;
                int drawEndX = spriteScreenX + drawWidth / 2;
                int drawStartY = halfScreen - drawHeight / 2;
                int drawEndY = halfScreen + drawHeight / 2;

                for (int stripe = drawStartX; stripe < drawEndX; stripe++)
                {
                    if (stripe < 0 || stripe >= Program.SCREEN_WIDTH)
                        continue;
                    if (transformY >= ZBuffer[stripe])
                        continue;

                    int yStart = drawStartY < 0 ? 0 : drawStartY;
                    int yEnd = drawEndY > Program.SCREEN_HEIGHT ? Program.SCREEN_HEIGHT : drawEndY;
                    if (yStart >= yEnd)
                        continue;

                    RectangleShape column = new RectangleShape(new Vector2f(1f, yEnd - yStart));
                    column.Position = new Vector2f(stripe, yStart);
                    column.FillColor = color;
                    window.Draw(column);
                }
            }
        }

        public static Vector2f GetFinalRay(Player player, float angle, Map map)
        {
            Vector2f rayPosY = GetRayYHit(player.Position, angle, map);
            Vector2f rayPosX = GetRayXHit(player.Position, angle, map);

            float distanceX = GetDistance(player.Position, rayPosX);
            float distanceY = GetDistance(player.Position, rayPosY);

            if (distanceX < distanceY)
            {
                return rayPosX;
            }
            else
            {
                return rayPosY;
            }
        }
        public static void DrawMinimapRays(Player player, RenderWindow window, Map map)
        {
            for (int rayNum = 0; rayNum < Program.SCREEN_WIDTH; rayNum++)
            {
                float angle = player.Angle - halfFov + rayNum * increment;
                if (angle < 0)
                    angle += MathF.PI * 2f;
                if (angle > MathF.PI * 2f)
                    angle -= MathF.PI * 2f;
                Vector2f rayPos = GetFinalRay(player, angle, map);
                Vertex[] wallStrip = new Vertex[2];
                wallStrip[0] = new Vertex(new Vector2f(player.Position.X, player.Position.Y), Color.Blue);
                wallStrip[1] = new Vertex(new Vector2f(rayPos.X, rayPos.Y), Color.Blue);

                window.Draw(wallStrip, PrimitiveType.Lines);
            }
        }
        public static float RadToDeg(float rad)
        {
            return (180 / MathF.PI) * rad;
        }
    }
}
