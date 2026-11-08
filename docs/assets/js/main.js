import {
  GHOST_COLLISION_RADIUS,
  KNIFE_PICKUP_RADIUS,
  MOUSE_SENSITIVITY,
  PLAYER_SPEED,
  PLAYER_SPRINT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "./constants.js";
import { advanceSurvival, resolveGhostCollision, tryPickupKnife, tryUseKnife } from "./gameLogic.js";
import { Ghost } from "./ghost.js";
import { Knife } from "./knife.js";
import { Map } from "./map.js";
import { distance } from "./mathUtils.js";
import { Player } from "./player.js";
import { draw3DWorldTextured, drawMinimap, drawSprites3D } from "./rays.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

const scoreEl = document.getElementById("score-line");
const knifeHintEl = document.getElementById("knife-hint");
const fpsEl = document.getElementById("fps");
const startOverlay = document.getElementById("start");
const gameOverOverlay = document.getElementById("gameover");
const finalScoreEl = document.getElementById("final-score");
const playBtn = document.getElementById("btn-play");
const restartBtn = document.getElementById("btn-restart");

const map = new Map();
let player;
let ghost;
let knife;
let textures = [];
let showMinimap = false;
let running = false;
let attackQueued = false;

const state = {
  score: 0,
  survivalTimer: 0,
  totalSurvival: 0,
  hasKnife: false,
  isKnifeSpawned: true,
  isGameOver: false,
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadTextures() {
  const files = [
    "assets/resources/hl22.png",
    "assets/resources/window.png",
    "assets/resources/brickwall2.png",
  ];
  textures = await Promise.all(files.map(loadImage));
}

function spawnEntities() {
  const playerPos = map.getRandomEmptyPosition();
  const playerCell = map.cellOf(playerPos);
  const ghostPos = map.getRandomEmptyPosition([[playerCell.x, playerCell.y]]);
  const ghostCell = map.cellOf(ghostPos);
  const knifePos = map.getRandomEmptyPosition([
    [playerCell.x, playerCell.y],
    [ghostCell.x, ghostCell.y],
  ]);

  player = new Player(playerPos);
  ghost = new Ghost(ghostPos);
  knife = new Knife(knifePos);
}

function resetGame() {
  state.score = 0;
  state.survivalTimer = 0;
  state.totalSurvival = 0;
  state.hasKnife = false;
  state.isKnifeSpawned = true;
  state.isGameOver = false;
  spawnEntities();
  gameOverOverlay.hidden = true;
  updateHud();
}

function updateHud() {
  scoreEl.textContent = `Score: ${state.score} | Survie: ${Math.floor(state.totalSurvival)}s`;
  knifeHintEl.style.display = state.hasKnife ? "block" : "none";
}

function requestPointerLock() {
  canvas.requestPointerLock?.();
}

function beginPlay() {
  resetGame();
  startOverlay.hidden = true;
  running = true;
  requestPointerLock();
}

function endGame() {
  state.isGameOver = true;
  finalScoreEl.textContent = `Score final: ${state.score}`;
  gameOverOverlay.hidden = false;
  document.exitPointerLock?.();
}

function onKeyDown(e) {
  if (!player) return;
  const k = e.code;

  if (k === "KeyM") {
    showMinimap = !showMinimap;
    return;
  }

  if (state.isGameOver && k === "KeyR") {
    resetGame();
    running = true;
    requestPointerLock();
    return;
  }

  if (state.isGameOver || !running) return;

  if (k === "KeyW" || k === "KeyZ") player.w = true;
  if (k === "KeyS") player.s = true;
  if (k === "KeyA" || k === "KeyQ") player.a = true;
  if (k === "KeyD") player.d = true;
  if (k === "ShiftLeft" || k === "ShiftRight") player.speed = PLAYER_SPRINT;
  if (k === "Space") {
    e.preventDefault();
    attackQueued = true;
  }
}

function onKeyUp(e) {
  if (!player) return;
  const k = e.code;
  if (k === "KeyW" || k === "KeyZ") player.w = false;
  if (k === "KeyS") player.s = false;
  if (k === "KeyA" || k === "KeyQ") player.a = false;
  if (k === "KeyD") player.d = false;
  if (k === "ShiftLeft" || k === "ShiftRight") player.speed = PLAYER_SPEED;
}

function onMouseMove(e) {
  if (!running || state.isGameOver || !player) return;
  if (document.pointerLockElement !== canvas) return;
  player.rotate(e.movementX * MOUSE_SENSITIVITY);
}

function update(dt) {
  if (!running || state.isGameOver) return;

  state.totalSurvival += dt;
  advanceSurvival(state, dt);
  updateHud();

  const distKnife = distance(player.x, player.y, knife.x, knife.y);
  tryPickupKnife(state, distKnife, KNIFE_PICKUP_RADIUS);

  const attacked = tryUseKnife(state, attackQueued);
  attackQueued = false;

  const distGhost = distance(player.x, player.y, ghost.x, ghost.y);
  const ghostKilled = resolveGhostCollision(
    state,
    attacked,
    distGhost,
    GHOST_COLLISION_RADIUS
  );

  if (ghostKilled) {
    const playerCell = map.cellOf(player.position);
    const newGhost = map.getRandomEmptyPosition([[playerCell.x, playerCell.y]]);
    const ghostCell = map.cellOf(newGhost);
    const newKnife = map.getRandomEmptyPosition([
      [playerCell.x, playerCell.y],
      [ghostCell.x, ghostCell.y],
    ]);
    ghost.position = newGhost;
    knife.position = newKnife;
    state.isKnifeSpawned = true;
  }

  if (state.isGameOver) {
    endGame();
    return;
  }

  player.update(dt, map);
  ghost.update(dt, map, player.position);
}

function render() {
  if (!player) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    return;
  }

  draw3DWorldTextured(ctx, player, map, textures);

  const sprites = [{ x: ghost.x, y: ghost.y, color: "#ff2222" }];
  if (state.isKnifeSpawned) {
    sprites.push({ x: knife.x, y: knife.y, color: "#5ad1e6" });
  }
  sprites.sort((a, b) => {
    const da = distance(player.x, player.y, a.x, a.y);
    const db = distance(player.x, player.y, b.x, b.y);
    return db - da;
  });
  drawSprites3D(ctx, player, sprites);

  if (showMinimap) {
    drawMinimap(ctx, player, map, ghost, knife, state.isKnifeSpawned);
  }
}

let lastTime = performance.now();
let fpsAccum = 0;
let fpsFrames = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  update(dt);
  render();

  fpsAccum += dt;
  fpsFrames++;
  if (fpsAccum >= 0.5) {
    const fps = fpsFrames / fpsAccum;
    fpsEl.textContent = `FPS: ${fps.toFixed(0)}`;
    fpsAccum = 0;
    fpsFrames = 0;
  }

  requestAnimationFrame(frame);
}

playBtn.addEventListener("click", beginPlay);
restartBtn.addEventListener("click", () => {
  resetGame();
  running = true;
  requestPointerLock();
});
canvas.addEventListener("click", () => {
  if (running && !state.isGameOver) requestPointerLock();
});

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("mousemove", onMouseMove);

loadTextures()
  .then(() => {
    spawnEntities();
    updateHud();
    requestAnimationFrame(frame);
  })
  .catch((err) => {
    console.error(err);
    startOverlay.querySelector("p").textContent =
      "Impossible de charger les textures. Vérifie le déploiement des assets.";
  });
