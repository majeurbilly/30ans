import { TILE_SIZE } from "./constants.js";

export class Map {
  constructor() {
    // Identique à Map.cs — index [x][y]
    this.worldMap = [
      [2, 3, 3, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2],
      [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
      [2, 0, 2, 2, 0, 2, 0, 2, 2, 2, 2, 0, 2, 0, 2, 2, 2, 2, 0, 3],
      [3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 3],
      [3, 0, 2, 0, 2, 2, 2, 3, 3, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 2],
      [2, 0, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 2, 0, 2],
      [2, 0, 3, 0, 2, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2],
      [2, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 2],
      [2, 0, 0, 0, 2, 0, 2, 0, 2, 2, 2, 0, 2, 0, 0, 0, 0, 2, 0, 3],
      [2, 2, 2, 2, 2, 0, 2, 0, 2, 0, 2, 0, 3, 0, 2, 2, 0, 2, 0, 3],
      [3, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 3, 0, 2, 0, 0, 2, 0, 2],
      [3, 0, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 0, 2, 2, 0, 2],
      [2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 2],
      [2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 0, 2, 2, 2, 2, 2, 2],
      [2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [2, 0, 2, 0, 3, 3, 3, 3, 3, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 3],
      [3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 3],
      [3, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 0, 2, 0, 2],
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
      [2, 2, 2, 3, 3, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 3, 3, 2, 2],
    ];
    this.sizeX = this.worldMap.length;
    this.sizeY = this.worldMap[0].length;
  }

  getRandomEmptyPosition(excludeCells = []) {
    const excluded = new Set(excludeCells.map(([x, y]) => `${x},${y}`));
    for (let attempts = 0; attempts < 10000; attempts++) {
      const x = Math.floor(Math.random() * this.sizeX);
      const y = Math.floor(Math.random() * this.sizeY);
      if (this.worldMap[x][y] === 0 && !excluded.has(`${x},${y}`)) {
        return { x: (x + 0.5) * TILE_SIZE, y: (y + 0.5) * TILE_SIZE };
      }
    }
    for (let x = 0; x < this.sizeX; x++) {
      for (let y = 0; y < this.sizeY; y++) {
        if (this.worldMap[x][y] === 0 && !excluded.has(`${x},${y}`)) {
          return { x: (x + 0.5) * TILE_SIZE, y: (y + 0.5) * TILE_SIZE };
        }
      }
    }
    throw new Error("No empty cell in map");
  }

  cellOf(pos) {
    return {
      x: Math.floor(pos.x / TILE_SIZE),
      y: Math.floor(pos.y / TILE_SIZE),
    };
  }

  isWallCell(cellX, cellY) {
    if (cellX < 0 || cellY < 0 || cellX >= this.sizeX || cellY >= this.sizeY) return true;
    return this.worldMap[cellX][cellY] !== 0;
  }

  isWallAt(worldX, worldY) {
    return this.isWallCell(Math.floor(worldX / TILE_SIZE), Math.floor(worldY / TILE_SIZE));
  }
}
