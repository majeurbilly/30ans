import { GHOST_SPEED, TILE_SIZE } from "./constants.js";

export class Ghost {
  constructor(position) {
    this.x = position.x;
    this.y = position.y;
    this.speed = GHOST_SPEED;
    this.currentPath = [];
    this.pathRecalculationTimer = 0;
  }

  get position() {
    return { x: this.x, y: this.y };
  }

  set position(pos) {
    this.x = pos.x;
    this.y = pos.y;
    this.currentPath = [];
  }

  update(deltaTime, map, target) {
    this.pathRecalculationTimer += deltaTime;
    if (this.pathRecalculationTimer >= 0.5 || this.currentPath.length === 0) {
      const start = {
        x: Math.floor(this.x / TILE_SIZE),
        y: Math.floor(this.y / TILE_SIZE),
      };
      const end = {
        x: Math.floor(target.x / TILE_SIZE),
        y: Math.floor(target.y / TILE_SIZE),
      };
      this.currentPath = computePathBFS(map, start, end);
      this.pathRecalculationTimer = 0;
    }

    if (this.currentPath.length === 0) return;

    const first = this.currentPath[0];
    const centerX = (first.x + 0.5) * TILE_SIZE;
    const centerY = (first.y + 0.5) * TILE_SIZE;
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 2) {
      this.currentPath.shift();
    } else if (dist > 1e-5) {
      const move = this.speed * deltaTime;
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;
    }
  }
}

function keyOf(cell) {
  return `${cell.x},${cell.y}`;
}

function computePathBFS(map, start, end) {
  const rows = map.sizeX;
  const cols = map.sizeY;
  if (start.x < 0 || start.x >= rows || start.y < 0 || start.y >= cols) return [];
  if (map.worldMap[start.x][start.y] !== 0) return [];
  if (end.x < 0 || end.x >= rows || end.y < 0 || end.y >= cols) return [];
  if (map.worldMap[end.x][end.y] !== 0) return [];
  if (start.x === end.x && start.y === end.y) return [];

  const queue = [start];
  const parent = new Map();
  parent.set(keyOf(start), start);

  const dX = [-1, 1, 0, 0];
  const dY = [0, 0, -1, 1];

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.x === end.x && cur.y === end.y) break;

    for (let i = 0; i < 4; i++) {
      const nx = cur.x + dX[i];
      const ny = cur.y + dY[i];
      if (nx < 0 || nx >= rows || ny < 0 || ny >= cols) continue;
      if (map.worldMap[nx][ny] !== 0) continue;
      const next = { x: nx, y: ny };
      const k = keyOf(next);
      if (parent.has(k)) continue;
      parent.set(k, cur);
      queue.push(next);
    }
  }

  if (!parent.has(keyOf(end))) return [];

  const path = [];
  let p = end;
  while (p.x !== start.x || p.y !== start.y) {
    path.push(p);
    p = parent.get(keyOf(p));
  }
  path.reverse();
  return path;
}
