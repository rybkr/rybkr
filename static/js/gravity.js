// Small rotating-rectangle simulation: gravity, bounces, and collisions.
// Feel: lower friction/drag means more sliding; higher bounce means livelier impacts.
const GRAVITY = 1000; // px/s²
const FRICTION = 0.25; // maximum friction impulse relative to the normal impulse
const AIR_DRAG = 0.25; // horizontal and angular damping per second
const RESTITUTION = 0.25; // fraction of impact speed returned as bounce
const BOUNCE_MIN_SPEED = 120; // px/s; slower contacts do not bounce
const INITIAL_HORIZONTAL_SPEED = 180; // total random range, px/s
const INITIAL_SPIN = 4; // total random range, rad/s

// Settling: lower speed or longer delay lets pieces move longer before sleeping.
const SLEEP_SPEED = 10; // px/s, including motion at the corners
const SLEEP_DELAY = 1; // seconds continuously below SLEEP_SPEED
const WAKE_SPEED = 20; // px/s impact needed to wake a sleeping piece
const MAX_SIMULATION_TIME = 15; // seconds; fallback cap for pathological piles

// Solver accuracy and spacing; these usually do not need adjustment.
const STEP_DURATION = 1 / 120; // seconds
const SOLVER_PASSES = 8;
const MAX_FRAME_DURATION = 0.05; // seconds; cap catch-up work after a paused tab
const INITIAL_FRAME_DURATION = 1 / 60; // seconds
const VIEWPORT_PADDING = 8; // px
const COLLISION_MARGIN = 0.5; // px
const CONTACT_TOLERANCE = 0.5; // px; corners treated as sharing a contact
const WALL_TOLERANCE = 0.1; // px
const PENETRATION_SLOP = 0.15; // px; tolerated overlap prevents contact jitter
const POSITION_CORRECTION = 0.8; // fraction of excess overlap corrected each pass
const PIECE_Z_INDEX = 5;

let resetGravity;

document.addEventListener("click", (event) => {
  if (!event.target.closest("a.runaway")) return;
  event.preventDefault();
  if (resetGravity) {
    resetGravity();
    return;
  }
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const main = document.querySelector("main");
  const elements = [...main.querySelectorAll("h1, h2, li > a, .social-links a, a.runaway")];
  // Measure everything before removing the pieces from normal layout.
  const pieces = elements.map((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rect = range.getBoundingClientRect();
    return {
      element, style: element.getAttribute("style"),
      x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
      w: rect.width, h: rect.height, angle: 0, spin: (Math.random() - 0.5) * INITIAL_SPIN,
      vx: (Math.random() - 0.5) * INITIAL_HORIZONTAL_SPEED, vy: 0, quietFor: 0, asleep: false,
    };
  });
  main.dataset.falling = "";
  pieces.forEach(({ element, w, h }) => {
    element.getAnimations().forEach((animation) => animation.cancel());
    Object.assign(element.style, {
      position: "fixed", display: "inline-block", left: "0", top: "0", margin: "0", padding: "0",
      width: `${w}px`, height: `${h}px`, zIndex: String(PIECE_Z_INDEX),
      animation: "none", willChange: "transform",
    });
    element.style.setProperty("--bar-left", "0px");
    element.style.setProperty("--bar-width", "100%");
  });

  let frame;
  let previous;
  let elapsed = 0;
  let accumulator = 0;
  let settled = false;

  function draw() {
    pieces.forEach(({ element, x, y, w, h, angle }) => {
      element.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${angle}rad)`;
    });
  }

  function axes(p) {
    const c = Math.cos(p.angle), s = Math.sin(p.angle);
    return [{ x: c, y: s }, { x: -s, y: c }];
  }

  function radius(p, basis, normal) {
    return Math.abs(basis[0].x * normal.x + basis[0].y * normal.y) * p.w / 2 +
      Math.abs(basis[1].x * normal.x + basis[1].y * normal.y) * p.h / 2;
  }

  // Test the four edge normals, so tilted pieces can nest together.
  function collision(a, b) {
    const aa = axes(a), ba = axes(b);
    const dx = b.x - a.x, dy = b.y - a.y;
    let depth = Infinity, normal;
    for (const axis of [...aa, ...ba]) {
      const distance = dx * axis.x + dy * axis.y;
      const overlap = radius(a, aa, axis) + radius(b, ba, axis) + COLLISION_MARGIN - Math.abs(distance);
      if (overlap <= 0) return;
      if (overlap < depth) {
        depth = overlap;
        const sign = distance >= 0 ? 1 : -1;
        normal = { x: axis.x * sign, y: axis.y * sign };
      }
    }
    return { depth, normal };
  }

  const cross = (a, b) => a.x * b.y - a.y * b.x;
  const inverseMass = (p) => p && !p.asleep ? 1 : 0;
  const inertia = (p) => p && !p.asleep ? 12 / (p.w * p.w + p.h * p.h) : 0;

  function vertices(p) {
    const [u, v] = axes(p);
    return [-1, 1].flatMap((i) => [-1, 1].map((j) => ({
      x: p.x + i * u.x * p.w / 2 + j * v.x * p.h / 2,
      y: p.y + i * u.y * p.w / 2 + j * v.y * p.h / 2,
    })));
  }

  // Impulses at the contact point change both speed and angular velocity.
  function resolve(a, b, normal, point) {
    const ra = { x: point.x - a.x, y: point.y - a.y };
    const rb = b ? { x: point.x - b.x, y: point.y - b.y } : { x: 0, y: 0 };
    const ia = inertia(a), ib = inertia(b);
    const ma = inverseMass(a), mb = inverseMass(b);
    const mass = ma + mb;
    if (!mass) return;
    function speed(axis) {
      const vx = (b ? b.vx - b.spin * rb.y : 0) - a.vx + a.spin * ra.y;
      const vy = (b ? b.vy + b.spin * rb.x : 0) - a.vy - a.spin * ra.x;
      return vx * axis.x + vy * axis.y;
    }
    function effectiveMass(axis) {
      return mass + cross(ra, axis) ** 2 * ia + cross(rb, axis) ** 2 * ib;
    }
    function apply(axis, impulse) {
      a.vx -= axis.x * impulse * ma;
      a.vy -= axis.y * impulse * ma;
      a.spin -= cross(ra, axis) * impulse * ia;
      if (b) {
        b.vx += axis.x * impulse * mb;
        b.vy += axis.y * impulse * mb;
        b.spin += cross(rb, axis) * impulse * ib;
      }
    }
    const closing = speed(normal);
    if (closing >= 0) return;
    const impulse = -closing * (closing < -BOUNCE_MIN_SPEED ? 1 + RESTITUTION : 1) / effectiveMass(normal);
    apply(normal, impulse);
    const tangent = { x: -normal.y, y: normal.x };
    const friction = -speed(tangent) / effectiveMass(tangent);
    apply(tangent, Math.max(-impulse * FRICTION, Math.min(impulse * FRICTION, friction)));
  }

  function wall(p, normal) {
    const corners = vertices(p);
    const furthest = Math.max(...corners.map((v) => v.x * normal.x + v.y * normal.y));
    const contacts = corners.filter((v) => furthest - v.x * normal.x - v.y * normal.y < CONTACT_TOLERANCE);
    for (const point of contacts) resolve(p, null, normal, point);
  }

  function contactPoint(a, b, normal) {
    const tangent = { x: -normal.y, y: normal.x };
    const project = (p, axis) => p.x * axis.x + p.y * axis.y;
    const aa = axes(a), ba = axes(b);
    const an = radius(a, aa, normal), bn = radius(b, ba, normal);
    const at = radius(a, aa, tangent), bt = radius(b, ba, tangent);
    const along = (project(a, normal) + an + project(b, normal) - bn) / 2;
    const side = (Math.max(project(a, tangent) - at, project(b, tangent) - bt) +
      Math.min(project(a, tangent) + at, project(b, tangent) + bt)) / 2;
    return { x: normal.x * along + tangent.x * side, y: normal.y * along + tangent.y * side };
  }

  function constrain(p) {
    if (p.asleep) return;
    const basis = axes(p);
    const halfWidth = radius(p, basis, { x: 1, y: 0 });
    const halfHeight = radius(p, basis, { x: 0, y: 1 });
    const left = VIEWPORT_PADDING + halfWidth;
    const right = Math.max(left, innerWidth - VIEWPORT_PADDING - halfWidth);
    const floor = Math.max(halfHeight, innerHeight - VIEWPORT_PADDING - halfHeight);
    if (p.x <= left + WALL_TOLERANCE || p.x >= right - WALL_TOLERANCE) {
      const normal = { x: p.x < (left + right) / 2 ? -1 : 1, y: 0 };
      p.x = Math.max(left, Math.min(right, p.x));
      wall(p, normal);
    }
    if (p.y >= floor - WALL_TOLERANCE) {
      p.y = floor;
      wall(p, { x: 0, y: 1 });
    }
  }

  function tick(time) {
    const dt = Math.min(previous === undefined ? INITIAL_FRAME_DURATION : (time - previous) / 1000, MAX_FRAME_DURATION);
    previous = time;
    accumulator += dt;
    while (accumulator >= STEP_DURATION) {
      accumulator -= STEP_DURATION;
      elapsed += STEP_DURATION;
      for (const p of pieces) {
        if (p.asleep) continue;
        p.vy += GRAVITY * STEP_DURATION;
        p.vx *= Math.exp(-AIR_DRAG * STEP_DURATION);
        p.spin *= Math.exp(-AIR_DRAG * STEP_DURATION);
        p.x += p.vx * STEP_DURATION;
        p.y += p.vy * STEP_DURATION;
        p.angle += p.spin * STEP_DURATION;
      }
      // Revisit contacts to propagate support from the floor through the pile.
      for (let pass = 0; pass < SOLVER_PASSES; pass++) {
        for (let i = 0; i < pieces.length; i++) {
          for (let j = i + 1; j < pieces.length; j++) {
            const a = pieces[i], b = pieces[j];
            if (a.asleep && b.asleep) continue;
            const contact = collision(a, b);
            if (!contact) continue;
            const { depth, normal } = contact;
            // A fresh impact wakes resting pieces; light resting contacts do not.
            const impact = (b.vx - a.vx) * normal.x + (b.vy - a.vy) * normal.y;
            if (impact < -WAKE_SPEED) {
              a.asleep = b.asleep = false;
              a.quietFor = b.quietFor = 0;
            }
            const ma = inverseMass(a), mb = inverseMass(b);
            const correction = Math.max(0, depth - PENETRATION_SLOP) * POSITION_CORRECTION / (ma + mb);
            a.x -= normal.x * correction * ma;
            a.y -= normal.y * correction * ma;
            b.x += normal.x * correction * mb;
            b.y += normal.y * correction * mb;
            resolve(a, b, normal, contactPoint(a, b, normal));
          }
        }
        pieces.forEach(constrain);
      }
      // Sleep each body once its center and corners have stayed slow.
      for (const p of pieces) {
        if (p.asleep) continue;
        const speed = Math.hypot(p.vx, p.vy) + Math.abs(p.spin) * Math.hypot(p.w, p.h) / 2;
        p.quietFor = speed < SLEEP_SPEED ? p.quietFor + STEP_DURATION : 0;
        if (p.quietFor > SLEEP_DELAY) {
          p.asleep = true;
          p.vx = p.vy = p.spin = 0;
        }
      }
      settled = pieces.every((p) => p.asleep);
      if (settled) break;
    }
    draw();
    if (!settled && elapsed < MAX_SIMULATION_TIME) frame = requestAnimationFrame(tick);
    else pieces.forEach(({ element }) => element.style.removeProperty("will-change"));
  }

  resetGravity = () => {
    cancelAnimationFrame(frame);
    pieces.forEach(({ element, style }) => {
      if (style === null) element.removeAttribute("style");
      else element.setAttribute("style", style);
    });
    delete main.dataset.falling;
    window.removeEventListener("resize", resetGravity);
    resetGravity = undefined;
  };
  window.addEventListener("resize", resetGravity);
  draw();
  frame = requestAnimationFrame(tick);
});
