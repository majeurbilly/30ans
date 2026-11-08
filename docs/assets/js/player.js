import { PLAYER_COLLISION_RADIUS, PLAYER_SPEED } from "./constants.js";
import { wrapAngle } from "./mathUtils.js";

export class Player {
  constructor(position) {
    this.x = position.x;
    this.y = position.y;
    this.angle = 0;
    this.speed = PLAYER_SPEED;
    this.w = false;
    this.a = false;
    this.s = false;
    this.d = false;
  }

  get direction() {
    return { x: Math.cos(this.angle), y: Math.sin(this.angle) };
  }

  get position() {
    return { x: this.x, y: this.y };
  }

  set position(pos) {
    this.x = pos.x;
    this.y = pos.y;
  }

  rotate(delta) {
    this.angle = wrapAngle(this.angle + delta);
  }

  update(deltaTime, map) {
    let dx = 0;
    let dy = 0;
    if (this.s) {
      dx += -Math.cos(this.angle);
      dy += -Math.sin(this.angle);
    }
    if (this.w) {
      dx += Math.cos(this.angle);
      dy += Math.sin(this.angle);
    }
    if (this.a) {
      dx += Math.sin(this.angle);
      dy += -Math.cos(this.angle);
    }
    if (this.d) {
      dx += -Math.sin(this.angle);
      dy += Math.cos(this.angle);
    }

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }

    const proposedX = this.x + dx * this.speed * deltaTime;
    const proposedY = this.y + dy * this.speed * deltaTime;

    if (!wouldCollide(proposedX, this.y, map)) this.x = proposedX;
    if (!wouldCollide(this.x, proposedY, map)) this.y = proposedY;
  }
}

function wouldCollide(x, y, map) {
  const r = PLAYER_COLLISION_RADIUS;
  return (
    map.isWallAt(x - r, y - r) ||
    map.isWallAt(x + r, y - r) ||
    map.isWallAt(x - r, y + r) ||
    map.isWallAt(x + r, y + r)
  );
}
