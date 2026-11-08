import {
  GROUND_COLOR,
  HALF_FOV,
  HALF_PI,
  HALF_SCREEN,
  HALF_THREE_PI,
  MAX_RAY_STEPS,
  RAY_INCREMENT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SKY_COLOR,
  TEXTURE_SIZE,
  TILE_SIZE,
  TWO_PI,
} from "./constants.js";
import { wrapAngle } from "./mathUtils.js";

export const zBuffer = new Float32Array(SCREEN_WIDTH);

function getDistance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

function getRayXHit(px, py, angle, map) {
  const perpendicularSlope = -1 / Math.tan(angle);
  let rayX = 0;
  let rayY = 0;
  let offsetX = 0;
  let offsetY = 0;

  if (angle > Math.PI) {
    rayY = Math.floor(py / TILE_SIZE) * TILE_SIZE - 0.0001;
    rayX = (py - rayY) * perpendicularSlope + px;
    offsetY = -TILE_SIZE;
    offsetX = -offsetY * perpendicularSlope;
  } else if (angle < Math.PI) {
    rayY = Math.floor(py / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
    rayX = (py - rayY) * perpendicularSlope + px;
    offsetY = TILE_SIZE;
    offsetX = -offsetY * perpendicularSlope;
  } else {
    return { x: px, y: py };
  }

  let steps = MAX_RAY_STEPS;
  while (steps > 0) {
    const mapX = Math.floor(rayX / TILE_SIZE);
    const mapY = Math.floor(rayY / TILE_SIZE);
    if (mapX < 0 || mapY < 0 || mapX > map.sizeX - 1 || mapY > map.sizeY - 1) break;
    if (map.worldMap[mapX][mapY] !== 0) break;
    rayX += offsetX;
    rayY += offsetY;
    steps--;
  }
  return { x: rayX, y: rayY };
}

function getRayYHit(px, py, angle, map) {
  const perpendicularSlope = -Math.tan(angle);
  let rayX = 0;
  let rayY = 0;
  let offsetX = 0;
  let offsetY = 0;

  if (angle > HALF_PI && angle < HALF_THREE_PI) {
    rayX = Math.floor(px / TILE_SIZE) * TILE_SIZE - 0.0001;
    rayY = (px - rayX) * perpendicularSlope + py;
    offsetX = -TILE_SIZE;
    offsetY = -offsetX * perpendicularSlope;
  } else if (angle < HALF_PI || angle > HALF_THREE_PI) {
    rayX = Math.floor(px / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
    rayY = (px - rayX) * perpendicularSlope + py;
    offsetX = TILE_SIZE;
    offsetY = -offsetX * perpendicularSlope;
  } else {
    return { x: px, y: py };
  }

  let steps = MAX_RAY_STEPS;
  while (steps > 0) {
    const mapX = Math.floor(rayX / TILE_SIZE);
    const mapY = Math.floor(rayY / TILE_SIZE);
    if (mapX < 0 || mapY < 0 || mapX > map.sizeX - 1 || mapY > map.sizeY - 1) break;
    if (map.worldMap[mapX][mapY] !== 0) break;
    rayX += offsetX;
    rayY += offsetY;
    steps--;
  }
  return { x: rayX, y: rayY };
}

function getFinalRay(player, angle, map) {
  const rayX = getRayXHit(player.x, player.y, angle, map);
  const rayY = getRayYHit(player.x, player.y, angle, map);
  const distX = getDistance(player.x, player.y, rayX.x, rayX.y);
  const distY = getDistance(player.x, player.y, rayY.x, rayY.y);
  return distX < distY ? rayX : rayY;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./player.js').Player} player
 * @param {import('./map.js').Map} map
 * @param {HTMLCanvasElement[]} textures textures[0]=id1, [1]=id2, [2]=id3
 */
export function draw3DWorldTextured(ctx, player, map, textures) {
  zBuffer.fill(Number.POSITIVE_INFINITY);

  ctx.fillStyle = SKY_COLOR;
  ctx.fillRect(0, 0, SCREEN_WIDTH, HALF_SCREEN);
  ctx.fillStyle = GROUND_COLOR;
  ctx.fillRect(0, HALF_SCREEN, SCREEN_WIDTH, HALF_SCREEN);

  for (let rayNum = 0; rayNum < SCREEN_WIDTH; rayNum++) {
    let angle = wrapAngle(player.angle - HALF_FOV + rayNum * RAY_INCREMENT);

    const hitX = getRayXHit(player.x, player.y, angle, map);
    const hitY = getRayYHit(player.x, player.y, angle, map);
    const distanceX = getDistance(player.x, player.y, hitX.x, hitX.y);
    const distanceY = getDistance(player.x, player.y, hitY.x, hitY.y);

    let finalPos = hitX;
    let finalDistance = distanceX;
    let textureX = 0;
    let shade = 1;

    if (distanceY < distanceX) {
      finalPos = hitY;
      finalDistance = distanceY;
      textureX = Math.floor((finalPos.y * (TEXTURE_SIZE / TILE_SIZE)) % TEXTURE_SIZE);
      shade = 1;
    } else {
      finalDistance = distanceX;
      finalPos = hitX;
      textureX = Math.floor((finalPos.x * (TEXTURE_SIZE / TILE_SIZE)) % TEXTURE_SIZE);
      shade = 200 / 255;
    }

    if (textureX < 0) textureX += TEXTURE_SIZE;

    const mapX = Math.floor(finalPos.x / TILE_SIZE);
    const mapY = Math.floor(finalPos.y / TILE_SIZE);
    const tile =
      mapX >= 0 && mapY >= 0 && mapX < map.sizeX && mapY < map.sizeY
        ? map.worldMap[mapX][mapY]
        : 1;

    finalDistance = finalDistance * Math.cos(angle - player.angle);
    if (finalDistance < 0.0001) finalDistance = 0.0001;
    zBuffer[rayNum] = finalDistance;

    const wallHeight = Math.floor(HALF_SCREEN / finalDistance * 100);
    const groundPixel = wallHeight + HALF_SCREEN;
    const ceilingPixel = -wallHeight + HALF_SCREEN;
    const textureID = Math.max(0, Math.min(textures.length - 1, tile - 1));
    const tex = textures[textureID];

    if (tex) {
      ctx.save();
      if (shade < 1) ctx.globalAlpha = shade;
      ctx.drawImage(
        tex,
        textureX,
        0,
        1,
        TEXTURE_SIZE,
        rayNum,
        ceilingPixel,
        1,
        groundPixel - ceilingPixel
      );
      ctx.restore();
    } else {
      ctx.fillStyle = shade < 1 ? "#999" : "#ccc";
      ctx.fillRect(rayNum, ceilingPixel, 1, groundPixel - ceilingPixel);
    }
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./player.js').Player} player
 * @param {{x:number,y:number,color:string}[]} sprites sorted far → near
 */
export function drawSprites3D(ctx, player, sprites) {
  const dir = player.direction;
  const planeScale = 0.66;
  const planeX = -dir.y * planeScale;
  const planeY = dir.x * planeScale;
  const invDet = 1.0 / (planeX * dir.y - planeY * dir.x);

  for (const sprite of sprites) {
    const spriteX = sprite.x - player.x;
    const spriteY = sprite.y - player.y;
    const transformX = invDet * (dir.y * spriteX - dir.x * spriteY);
    const transformY = invDet * (-planeY * spriteX + planeX * spriteY);
    if (transformY <= 0) continue;

    const spriteScreenX = Math.floor((SCREEN_WIDTH / 2) * (1 + transformX / transformY));
    const spriteHeight = Math.abs((SCREEN_HEIGHT / transformY) * 100 * 0.5);
    const drawWidth = Math.floor(spriteHeight);
    const drawHeight = Math.floor(spriteHeight);
    const drawStartX = spriteScreenX - Math.floor(drawWidth / 2);
    const drawEndX = spriteScreenX + Math.floor(drawWidth / 2);
    const drawStartY = HALF_SCREEN - Math.floor(drawHeight / 2);
    const drawEndY = HALF_SCREEN + Math.floor(drawHeight / 2);

    ctx.fillStyle = sprite.color;
    for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
      if (stripe < 0 || stripe >= SCREEN_WIDTH) continue;
      if (transformY >= zBuffer[stripe]) continue;
      const yStart = Math.max(0, drawStartY);
      const yEnd = Math.min(SCREEN_HEIGHT, drawEndY);
      if (yStart >= yEnd) continue;
      ctx.fillRect(stripe, yStart, 1, yEnd - yStart);
    }
  }
}

export function drawMinimap(ctx, player, map, ghost, pickups = []) {
  const scale = 0.18;
  const tile = TILE_SIZE * scale;
  const originX = 10;
  const originY = 10;

  ctx.save();
  ctx.globalAlpha = 0.85;

  for (let x = 0; x < map.sizeX; x++) {
    for (let y = 0; y < map.sizeY; y++) {
      ctx.fillStyle = map.worldMap[x][y] !== 0 ? "#aa2222" : "#111";
      ctx.fillRect(originX + x * tile, originY + y * tile, tile + 0.5, tile + 0.5);
    }
  }

  // Rays (subset for perf)
  ctx.strokeStyle = "#4488ff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let rayNum = 0; rayNum < SCREEN_WIDTH; rayNum += 8) {
    const angle = wrapAngle(player.angle - HALF_FOV + rayNum * RAY_INCREMENT);
    const hit = getFinalRay(player, angle, map);
    ctx.moveTo(originX + player.x * scale, originY + player.y * scale);
    ctx.lineTo(originX + hit.x * scale, originY + hit.y * scale);
  }
  ctx.stroke();

  // Player
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(originX + player.x * scale, originY + player.y * scale, 3, 0, TWO_PI);
  ctx.fill();

  // Ghost
  ctx.fillStyle = "#ff2222";
  ctx.beginPath();
  ctx.arc(originX + ghost.x * scale, originY + ghost.y * scale, 3, 0, TWO_PI);
  ctx.fill();

  for (const pickup of pickups) {
    if (pickup.collected) continue;
    ctx.fillStyle = pickup.color;
    ctx.beginPath();
    ctx.arc(originX + pickup.x * scale, originY + pickup.y * scale, 2.5, 0, TWO_PI);
    ctx.fill();
  }

  ctx.restore();
}
