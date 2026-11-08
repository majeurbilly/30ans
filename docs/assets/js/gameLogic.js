export function advanceSurvival(state, deltaTime) {
  if (deltaTime <= 0) return false;
  state.survivalTimer += deltaTime;
  const gained = Math.floor(state.survivalTimer / 1);
  if (gained <= 0) return false;
  state.score += gained;
  state.survivalTimer -= gained;
  return true;
}

export function tryPickupInfo(state, info, distanceToInfo, pickupThreshold) {
  if (!info || info.collected) return false;
  if (distanceToInfo >= pickupThreshold) return false;
  info.collected = true;
  if (!state.collectedIds.includes(info.id)) {
    state.collectedIds.push(info.id);
  }
  state.score += 250;
  if (state.collectedIds.length >= state.totalInfos) {
    state.isVictory = true;
  }
  return true;
}

export function resolveGhostCollision(state, distanceToGhost, collisionThreshold) {
  if (distanceToGhost >= collisionThreshold) return false;
  state.isGameOver = true;
  return true;
}
