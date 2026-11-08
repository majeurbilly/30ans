export function advanceSurvival(state, deltaTime) {
  if (deltaTime <= 0) return false;
  state.survivalTimer += deltaTime;
  const gained = Math.floor(state.survivalTimer / 1);
  if (gained <= 0) return false;
  state.score += gained;
  state.survivalTimer -= gained;
  return true;
}

export function tryPickupKnife(state, distanceToKnife, pickupThreshold) {
  if (!state.isKnifeSpawned || distanceToKnife >= pickupThreshold) return false;
  state.hasKnife = true;
  state.isKnifeSpawned = false;
  return true;
}

export function tryUseKnife(state, isAttackPressed) {
  if (!state.hasKnife || !isAttackPressed) return false;
  state.hasKnife = false;
  return true;
}

export function resolveGhostCollision(state, playerAttacked, distanceToGhost, collisionThreshold) {
  if (distanceToGhost >= collisionThreshold) return false;
  if (playerAttacked) {
    state.score += 1000;
    return true;
  }
  state.isGameOver = true;
  return false;
}
