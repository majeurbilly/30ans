using SFML.Graphics;
using SFML.System;
using SFML.Window;

namespace Raycaster
{
    public class Knife
    {
        public Vector2f Position { get; set; }
        private CircleShape shape;

        public Knife(Vector2f position)
        {
            Position = position;
            shape = new CircleShape(3f);
            shape.FillColor = Color.Cyan;
            shape.Origin = new Vector2f(3f, 3f);
        }

        public void DrawOnMinimap(RenderWindow window)
        {
            shape.Position = Position;
            window.Draw(shape);
        }
    }
}

