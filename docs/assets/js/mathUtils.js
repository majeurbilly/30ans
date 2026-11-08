export function distance(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.hypot(dx, dy);
}

export function wrapAngle(angle) {
  const twoPi = Math.PI * 2;
  while (angle < 0) angle += twoPi;
  while (angle >= twoPi) angle -= twoPi;
  return angle;
}
