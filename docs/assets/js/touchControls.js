export function createTouchControls({
  root,
  onMove,
  onLook,
  onSprint,
  isEnabled,
}) {
  const moveEl = root.querySelector("#stick-move");
  const lookEl = root.querySelector("#look-zone");
  const sprintEl = root.querySelector("#btn-sprint");

  if (!moveEl || !lookEl) {
    return {
      show() {},
      hide() {},
      destroy() {},
    };
  }

  const moveKnob = moveEl.querySelector(".stick-knob");
  const moveState = { active: false, id: null, cx: 0, cy: 0, max: 48 };
  const lookState = { active: false, id: null, lastX: 0, lastY: 0 };

  function setVisible(visible) {
    root.hidden = !visible;
  }

  function resetMove() {
    moveState.active = false;
    moveState.id = null;
    if (moveKnob) {
      moveKnob.style.transform = "translate(-50%, -50%)";
    }
    onMove(0, 0);
  }

  function updateMove(clientX, clientY) {
    const rect = moveEl.getBoundingClientRect();
    moveState.cx = rect.left + rect.width / 2;
    moveState.cy = rect.top + rect.height / 2;
    let dx = clientX - moveState.cx;
    let dy = clientY - moveState.cy;
    const len = Math.hypot(dx, dy);
    if (len > moveState.max) {
      dx = (dx / len) * moveState.max;
      dy = (dy / len) * moveState.max;
    }
    if (moveKnob) {
      moveKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
    onMove(dx / moveState.max, dy / moveState.max);
  }

  function onMoveStart(e) {
    if (!isEnabled()) return;
    const t = e.changedTouches[0];
    moveState.active = true;
    moveState.id = t.identifier;
    updateMove(t.clientX, t.clientY);
    e.preventDefault();
  }

  function onMoveMove(e) {
    if (!moveState.active) return;
    for (const t of e.changedTouches) {
      if (t.identifier === moveState.id) {
        updateMove(t.clientX, t.clientY);
        e.preventDefault();
        break;
      }
    }
  }

  function onMoveEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === moveState.id) {
        resetMove();
        e.preventDefault();
        break;
      }
    }
  }

  function onLookStart(e) {
    if (!isEnabled()) return;
    const t = e.changedTouches[0];
    lookState.active = true;
    lookState.id = t.identifier;
    lookState.lastX = t.clientX;
    lookState.lastY = t.clientY;
    e.preventDefault();
  }

  function onLookMove(e) {
    if (!lookState.active) return;
    for (const t of e.changedTouches) {
      if (t.identifier === lookState.id) {
        const dx = t.clientX - lookState.lastX;
        lookState.lastX = t.clientX;
        lookState.lastY = t.clientY;
        onLook(dx);
        e.preventDefault();
        break;
      }
    }
  }

  function onLookEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === lookState.id) {
        lookState.active = false;
        lookState.id = null;
        e.preventDefault();
        break;
      }
    }
  }

  function onSprintStart(e) {
    if (!isEnabled()) return;
    onSprint(true);
    e.preventDefault();
  }

  function onSprintEnd(e) {
    onSprint(false);
    e.preventDefault();
  }

  moveEl.addEventListener("touchstart", onMoveStart, { passive: false });
  moveEl.addEventListener("touchmove", onMoveMove, { passive: false });
  moveEl.addEventListener("touchend", onMoveEnd, { passive: false });
  moveEl.addEventListener("touchcancel", onMoveEnd, { passive: false });

  lookEl.addEventListener("touchstart", onLookStart, { passive: false });
  lookEl.addEventListener("touchmove", onLookMove, { passive: false });
  lookEl.addEventListener("touchend", onLookEnd, { passive: false });
  lookEl.addEventListener("touchcancel", onLookEnd, { passive: false });

  if (sprintEl) {
    sprintEl.addEventListener("touchstart", onSprintStart, { passive: false });
    sprintEl.addEventListener("touchend", onSprintEnd, { passive: false });
    sprintEl.addEventListener("touchcancel", onSprintEnd, { passive: false });
  }

  return {
    show: () => setVisible(true),
    hide: () => {
      setVisible(false);
      resetMove();
      onSprint(false);
    },
    destroy() {
      resetMove();
    },
  };
}

export function isTouchPreferred() {
  return window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
}
