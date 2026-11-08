import {
  GHOST_COLLISION_RADIUS,
  INFO_PICKUP_RADIUS,
  MOUSE_SENSITIVITY,
  PLAYER_SPEED,
  PLAYER_SPRINT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TOUCH_LOOK_SENSITIVITY,
} from "./constants.js";
import { advanceSurvival, resolveGhostCollision, tryPickupInfo } from "./gameLogic.js";
import { Ghost } from "./ghost.js";
import { InfoPickup } from "./infoPickup.js";
import { Map } from "./map.js";
import { distance } from "./mathUtils.js";
import { FORMSPREE_ENDPOINT, PARTY_INFOS } from "./partyInfos.js";
import { Player } from "./player.js";
import { draw3DWorldTextured, drawMinimap, drawSprites3D } from "./rays.js";
import { createTouchControls, isTouchPreferred } from "./touchControls.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

const scoreEl = document.getElementById("score-line");
const infoChipsEl = document.getElementById("info-chips");
const fpsEl = document.getElementById("fps");
const startOverlay = document.getElementById("start");
const gameOverOverlay = document.getElementById("gameover");
const victoryOverlay = document.getElementById("victory");
const finalScoreEl = document.getElementById("final-score");
const victoryScoreEl = document.getElementById("victory-score");
const victorySummaryEl = document.getElementById("victory-summary");
const playBtn = document.getElementById("btn-play");
const restartBtn = document.getElementById("btn-restart");
const replayBtn = document.getElementById("btn-replay");
const toastEl = document.getElementById("pickup-toast");
const toastKicker = document.getElementById("toast-kicker");
const toastTitle = document.getElementById("toast-title");
const toastBody = document.getElementById("toast-body");
const rsvpForm = document.getElementById("rsvp-form");
const formStatus = document.getElementById("form-status");
const formScore = document.getElementById("form-score");
const formSurvival = document.getElementById("form-survival");
const controlsPc = document.getElementById("controls-pc");
const controlsTouch = document.getElementById("controls-touch");
const touchRoot = document.getElementById("touch-controls");

const map = new Map();
let player;
let ghost;
let pickups = [];
let textures = [];
let showMinimap = false;
let running = false;
let toastTimer = 0;
let touchMoveX = 0;
let touchMoveY = 0;
const useTouch = isTouchPreferred();

const state = {
  score: 0,
  survivalTimer: 0,
  totalSurvival: 0,
  collectedIds: [],
  totalInfos: PARTY_INFOS.length,
  isGameOver: false,
  isVictory: false,
};

if (useTouch) {
  controlsPc.hidden = true;
  controlsTouch.hidden = false;
  document.body.classList.add("touch-mode");
}

const touch = createTouchControls({
  root: touchRoot,
  isEnabled: () => running && !state.isGameOver && !state.isVictory,
  onMove: (x, y) => {
    touchMoveX = x;
    touchMoveY = y;
  },
  onLook: (dx) => {
    if (!player || !running || state.isGameOver || state.isVictory) return;
    player.rotate(dx * TOUCH_LOOK_SENSITIVITY);
  },
  onSprint: (active) => {
    if (!player) return;
    player.speed = active ? PLAYER_SPRINT : PLAYER_SPEED;
  },
});

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
  const excluded = [];
  const playerPos = map.getRandomEmptyPosition(excluded);
  const playerCell = map.cellOf(playerPos);
  excluded.push([playerCell.x, playerCell.y]);

  const ghostPos = map.getRandomEmptyPosition(excluded);
  const ghostCell = map.cellOf(ghostPos);
  excluded.push([ghostCell.x, ghostCell.y]);

  player = new Player(playerPos);
  ghost = new Ghost(ghostPos);

  pickups = PARTY_INFOS.map((info) => {
    const pos = map.getRandomEmptyPosition(excluded);
    const cell = map.cellOf(pos);
    excluded.push([cell.x, cell.y]);
    return new InfoPickup(info, pos);
  });
}

function resetGame() {
  state.score = 0;
  state.survivalTimer = 0;
  state.totalSurvival = 0;
  state.collectedIds = [];
  state.isGameOver = false;
  state.isVictory = false;
  toastTimer = 0;
  toastEl.hidden = true;
  touchMoveX = 0;
  touchMoveY = 0;
  spawnEntities();
  gameOverOverlay.hidden = true;
  victoryOverlay.hidden = true;
  formStatus.textContent = "";
  formStatus.className = "form-status";
  rsvpForm.querySelectorAll("input, select, textarea, button").forEach((el) => {
    el.disabled = false;
    if (el.type !== "hidden" && el.type !== "submit" && el.tagName !== "BUTTON") {
      if (el.tagName === "SELECT") el.selectedIndex = 0;
      else el.value = "";
    }
  });
  formScore.value = "";
  formSurvival.value = "";
  updateHud();
}

function updateHud() {
  const collected = state.collectedIds.length;
  scoreEl.textContent = `Infos ${collected}/${state.totalInfos} · Score ${state.score} · Survie ${Math.floor(state.totalSurvival)}s`;

  infoChipsEl.innerHTML = PARTY_INFOS.map((info) => {
    const done = state.collectedIds.includes(info.id);
    return `<span class="chip${done ? " chip-done" : ""}" style="--chip:${info.color}">${info.shortLabel}</span>`;
  }).join("");
}

function showPickupToast(info) {
  toastKicker.textContent = "Info trouvée";
  toastTitle.textContent = info.title;
  toastBody.textContent = info.body;
  toastEl.style.setProperty("--toast-accent", info.color);
  toastEl.hidden = false;
  toastTimer = 3.2;
}

function requestPointerLock() {
  if (useTouch) return;
  canvas.requestPointerLock?.();
}

function beginPlay() {
  resetGame();
  startOverlay.hidden = true;
  running = true;
  requestPointerLock();
  if (useTouch) touch.show();
}

function endGameLost() {
  state.isGameOver = true;
  running = false;
  finalScoreEl.textContent = `Score final: ${state.score} · Infos ${state.collectedIds.length}/${state.totalInfos}`;
  gameOverOverlay.hidden = false;
  document.exitPointerLock?.();
  touch.hide();
}

function endGameWon() {
  state.isVictory = true;
  running = false;
  victoryScoreEl.textContent = `Score final: ${state.score} · Survie ${Math.floor(state.totalSurvival)}s`;
  victorySummaryEl.innerHTML = PARTY_INFOS.map(
    (info) => `<li><strong>${info.title}</strong> — ${info.body}</li>`
  ).join("");
  formScore.value = String(state.score);
  formSurvival.value = `${Math.floor(state.totalSurvival)}s`;
  victoryOverlay.hidden = false;
  document.exitPointerLock?.();
  touch.hide();
}

function applyTouchMovement() {
  if (!player || !useTouch) return;
  player.w = touchMoveY < -0.25;
  player.s = touchMoveY > 0.25;
  player.a = touchMoveX < -0.25;
  player.d = touchMoveX > 0.25;
}

function onKeyDown(e) {
  if (!player) return;
  const k = e.code;

  if (k === "KeyM") {
    showMinimap = !showMinimap;
    return;
  }

  if ((state.isGameOver || state.isVictory) && k === "KeyR") {
    beginPlay();
    return;
  }

  if (state.isGameOver || state.isVictory || !running) return;

  if (k === "KeyW" || k === "KeyZ") player.w = true;
  if (k === "KeyS") player.s = true;
  if (k === "KeyA" || k === "KeyQ") player.a = true;
  if (k === "KeyD") player.d = true;
  if (k === "ShiftLeft" || k === "ShiftRight") player.speed = PLAYER_SPRINT;
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
  if (!running || state.isGameOver || state.isVictory || !player) return;
  if (document.pointerLockElement !== canvas) return;
  player.rotate(e.movementX * MOUSE_SENSITIVITY);
}

function update(dt) {
  if (!running || state.isGameOver || state.isVictory) {
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) toastEl.hidden = true;
    }
    return;
  }

  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) toastEl.hidden = true;
  }

  state.totalSurvival += dt;
  advanceSurvival(state, dt);
  updateHud();

  applyTouchMovement();

  for (const pickup of pickups) {
    if (pickup.collected) continue;
    const dist = distance(player.x, player.y, pickup.x, pickup.y);
    if (tryPickupInfo(state, pickup, dist, INFO_PICKUP_RADIUS)) {
      showPickupToast(pickup);
      updateHud();
    }
  }

  if (state.isVictory) {
    endGameWon();
    return;
  }

  const distGhost = distance(player.x, player.y, ghost.x, ghost.y);
  resolveGhostCollision(state, distGhost, GHOST_COLLISION_RADIUS);

  if (state.isGameOver) {
    endGameLost();
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
  for (const pickup of pickups) {
    if (pickup.collected) continue;
    sprites.push({ x: pickup.x, y: pickup.y, color: pickup.color });
  }
  sprites.sort((a, b) => {
    const da = distance(player.x, player.y, a.x, a.y);
    const db = distance(player.x, player.y, b.x, b.y);
    return db - da;
  });
  drawSprites3D(ctx, player, sprites);

  if (showMinimap) {
    drawMinimap(ctx, player, map, ghost, pickups);
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
restartBtn.addEventListener("click", beginPlay);
replayBtn.addEventListener("click", beginPlay);

canvas.addEventListener("click", () => {
  if (running && !state.isGameOver && !state.isVictory) requestPointerLock();
});

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("guest-name").value.trim();
  const email = document.getElementById("guest-email").value.trim();
  const rsvp = document.getElementById("guest-rsvp").value;
  const message = document.getElementById("guest-message").value.trim();

  if (!name || !email) {
    formStatus.textContent = "Prénom et courriel requis.";
    formStatus.className = "form-status form-error";
    return;
  }

  const submitBtn = document.getElementById("btn-rsvp");
  submitBtn.disabled = true;
  formStatus.textContent = "Envoi en cours…";
  formStatus.className = "form-status";

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        rsvp,
        message,
        score: state.score,
        survival: `${Math.floor(state.totalSurvival)}s`,
        infos: `${state.collectedIds.length}/${state.totalInfos}`,
        _subject: "RSVP 30 ans Billy & Micky Blue",
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    formStatus.textContent = "Reçu ! Merci, on a hâte de te voir.";
    formStatus.className = "form-status form-ok";
    rsvpForm.querySelectorAll("input, select, textarea, button[type=submit]").forEach((el) => {
      if (el.type !== "hidden") el.disabled = true;
    });
  } catch (err) {
    console.error(err);
    formStatus.textContent = "Envoi impossible. Réessaie dans un instant.";
    formStatus.className = "form-status form-error";
    submitBtn.disabled = false;
  }
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
    startOverlay.querySelector(".tagline").textContent =
      "Impossible de charger les textures. Vérifie le déploiement des assets.";
  });
