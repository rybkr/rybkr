const runawayButton = document.querySelector("a.runaway");
const runawayEnabled = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

if (runawayButton) {
  let pointer;
  let frame;
  let previousTime;
  let position;
  let obstacles = [];
  let velocity = { x: 0, y: 0 };
  const margin = 16;
  const dangerRadius = 130;
  const initialDangerRadius = 1;
  const initialFrameDurationMs = 16;
  const maxFrameDurationSeconds = 0.032;
  const baseSpeed = 80;
  const proximitySpeedBoost = 720;
  const proximitySpeedExponent = 2;
  const escapeDirectionCount = 32;
  const escapeLookaheadDistance = 65;
  const minimumTravelDistance = 1;
  const obstacleClearance = 45;
  const obstaclePenaltyWeight = 3;
  const momentumScoreWeight = 0.06;
  const velocityBlendRate = 12;
  const stoppingSpeed = 1;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function clearance(a, b) {
    return Math.hypot(Math.max(b.left - a.right, a.left - b.right, 0),
      Math.max(b.top - a.bottom, a.top - b.bottom, 0));
  }

  function updateObstacles() {
    obstacles = [...document.querySelectorAll("main h1, main h2, main a")]
      .filter((element) => element !== runawayButton)
      .flatMap((element) => {
        // Measure visible content rather than the full-width link rows.
        const range = document.createRange();
        range.selectNodeContents(element);
        return [...range.getClientRects()];
      });
  }

  function place() {
    const flipped = document.documentElement.classList.contains("upside-down");
    const body = document.body.getBoundingClientRect();
    const rect = runawayButton.getBoundingClientRect();
    runawayButton.style.left = `${flipped ? body.right - position.x - rect.width : position.x}px`;
    runawayButton.style.top = `${flipped ? body.bottom - position.y - rect.height : position.y}px`;
  }

  function animate(time) {
    frame = undefined;
    if (!pointer || !runawayEnabled.matches || runawayButton.matches(":focus-visible")) {
      velocity = { x: 0, y: 0 };
      previousTime = undefined;
      return;
    }
    const rect = runawayButton.getBoundingClientRect();
    const distance = clearance(rect, {
      left: pointer.x, right: pointer.x, top: pointer.y, bottom: pointer.y,
    });
    const dt = Math.min(
      (time - (previousTime ?? time - initialFrameDurationMs)) / 1000,
      maxFrameDurationSeconds);
    previousTime = time;
    let target = { x: 0, y: 0 };
    // Stay put until the pointer is close; once loose, react from farther away.
    const activeRadius = position ? dangerRadius : initialDangerRadius;

    if (distance < activeRadius) {
      if (!position) {
        // Preserve the row and dimensions when switching to viewport coordinates.
        position = { x: rect.left, y: rect.top };
        runawayButton.parentElement.style.minHeight = `${rect.height}px`;
        runawayButton.style.width = `${rect.width}px`;
        runawayButton.classList.add("is-running");
        place();
        updateObstacles();
      }
      const proximity = 1 - distance / dangerRadius;
      const speed = baseSpeed + proximitySpeedBoost * proximity ** proximitySpeedExponent;
      let bestScore = -Infinity;
      // Compare nearby escape directions, penalizing routes through other content.
      for (let i = 0; i < escapeDirectionCount; i++) {
        const angle = i * (2 * Math.PI / escapeDirectionCount);
        const x = clamp(position.x + Math.cos(angle) * escapeLookaheadDistance, margin,
          Math.max(margin, innerWidth - rect.width - margin));
        const y = clamp(position.y + Math.sin(angle) * escapeLookaheadDistance, margin,
          Math.max(margin, innerHeight - rect.height - margin));
        const candidate = { left: x, top: y, right: x + rect.width, bottom: y + rect.height };
        const travel = Math.hypot(x - position.x, y - position.y);
        if (travel < minimumTravelDistance) continue;
        const contentPenalty = obstacles.reduce((sum, obstacle) =>
          sum + Math.max(0, obstacleClearance - clearance(candidate, obstacle)) * obstaclePenaltyWeight, 0);
        const score = Math.hypot(x + rect.width / 2 - pointer.x,
          y + rect.height / 2 - pointer.y) - contentPenalty +
          (velocity.x * Math.cos(angle) + velocity.y * Math.sin(angle)) * momentumScoreWeight;
        if (score > bestScore) {
          bestScore = score;
          target = { x: (x - position.x) / travel * speed,
            y: (y - position.y) / travel * speed };
        }
      }
    }

    const blend = 1 - Math.exp(-velocityBlendRate * dt);
    velocity.x += (target.x - velocity.x) * blend;
    velocity.y += (target.y - velocity.y) * blend;
    if (position) {
      position.x = clamp(position.x + velocity.x * dt, margin,
        Math.max(margin, innerWidth - rect.width - margin));
      position.y = clamp(position.y + velocity.y * dt, margin,
        Math.max(margin, innerHeight - rect.height - margin));
      place();
    }
    if (distance < activeRadius || Math.hypot(velocity.x, velocity.y) > stoppingSpeed) {
      frame = requestAnimationFrame(animate);
    } else {
      previousTime = undefined;
    }
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(animate);
  });
  document.addEventListener("pointerleave", () => { pointer = undefined; });
  // The site-wide click handler flips the page before we resync coordinates.
  document.addEventListener("click", (event) => {
    if (!event.target.closest("a.runaway")) return;
    stop();
    if (position) {
      const rect = runawayButton.getBoundingClientRect();
      position = { x: rect.left, y: rect.top };
      updateObstacles();
    }
    if (event.detail > 0) {
      pointer = { x: event.clientX, y: event.clientY };
      frame = requestAnimationFrame(animate);
    }
  });

  function stop() {
    cancelAnimationFrame(frame);
    frame = previousTime = pointer = undefined;
    velocity = { x: 0, y: 0 };
  }

  function updateLayout() {
    stop();
    if (!position) return;
    updateObstacles();
    const rect = runawayButton.getBoundingClientRect();
    // Keep its position unless the viewport has become too small to contain it.
    position.x = clamp(position.x, margin, Math.max(margin, innerWidth - rect.width - margin));
    position.y = clamp(position.y, margin, Math.max(margin, innerHeight - rect.height - margin));
    place();
  }

  window.addEventListener("resize", updateLayout);
  window.addEventListener("scroll", updateLayout, { passive: true });
  runawayEnabled.addEventListener("change", stop);
}
