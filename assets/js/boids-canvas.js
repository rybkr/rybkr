(function() {
  'use strict';

  function createBoidsCanvas(canvas, options = {}) {
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const boids = [];
    const avoidElements = Array.from(options.avoidElements || []);
    const avoidRects = [];
    const bursts = [];
    const pointer = { x: 0, y: 0, active: false };
    const config = {
      topOffset: options.topOffset || 60,
      minHeight: options.minHeight || 320,
      minCount: options.minCount || 24,
      maxCount: options.maxCount || 52,
      density: options.density || 28000,
      minSpeed: options.minSpeed || 0.63,
      maxSpeed: options.maxSpeed || 2.32,
      startSpeed: options.startSpeed || 0.82,
      startSpeedRange: options.startSpeedRange || 1.05,
      maxSteer: options.maxSteer || 0.072,
      pointerRadius: options.pointerRadius || 174,
      pointerForce: options.pointerForce || 0.052,
      clickRadius: options.clickRadius || 230,
      clickForce: options.clickForce || 0.16,
      clickDuration: options.clickDuration || 620,
      avoidPadding: options.avoidPadding || 24,
      avoidDistance: options.avoidDistance || 42,
      avoidForce: options.avoidForce || 0.074
    };

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frameId = null;
    let destroyed = false;

    function cssColor(name, fallback) {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return value || fallback;
    }

    function createBoid() {
      const angle = Math.random() * Math.PI * 2;
      const speed = config.startSpeed + Math.random() * config.startSpeedRange;
      return {
        x: Math.random() * Math.max(width, 1),
        y: Math.random() * Math.max(height, 1),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle,
        size: 2.6 + Math.random() * 1.8
      };
    }

    function resize() {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = Math.max(window.innerHeight - config.topOffset, config.minHeight);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const targetCount = Math.max(
        config.minCount,
        Math.min(config.maxCount, Math.floor((width * height) / config.density))
      );
      while (boids.length < targetCount) boids.push(createBoid());
      boids.length = targetCount;
      measureAvoidRects();
    }

    function measureAvoidRects() {
      avoidRects.length = 0;

      for (const element of avoidElements) {
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;

        avoidRects.push({
          left: rect.left - config.avoidPadding,
          right: rect.right + config.avoidPadding,
          top: rect.top - config.topOffset - config.avoidPadding,
          bottom: rect.bottom - config.topOffset + config.avoidPadding
        });
      }
    }

    function addAvoidanceForce(boid, rect, scale, steer) {
      const nearestX = Math.max(rect.left, Math.min(boid.x, rect.right));
      const nearestY = Math.max(rect.top, Math.min(boid.y, rect.bottom));
      const inside = boid.x > rect.left && boid.x < rect.right && boid.y > rect.top && boid.y < rect.bottom;
      let dx = boid.x - nearestX;
      let dy = boid.y - nearestY;
      let distance = Math.hypot(dx, dy);

      if (!inside && distance > config.avoidDistance) return;

      if (distance < 0.001) {
        dx = boid.x - (rect.left + rect.right) / 2;
        dy = boid.y - (rect.top + rect.bottom) / 2;
        distance = Math.hypot(dx, dy) || 1;
      }

      const force = inside ? 1 : (config.avoidDistance - distance) / config.avoidDistance;
      steer.x += (dx / distance) * force * scale;
      steer.y += (dy / distance) * force * scale;
    }

    function limitVelocity(boid) {
      const speed = Math.hypot(boid.vx, boid.vy) || 1;

      if (speed > config.maxSpeed) {
        boid.vx = (boid.vx / speed) * config.maxSpeed;
        boid.vy = (boid.vy / speed) * config.maxSpeed;
      } else if (speed < config.minSpeed) {
        boid.vx = (boid.vx / speed) * config.minSpeed;
        boid.vy = (boid.vy / speed) * config.minSpeed;
      }
    }

    function updateBoid(boid) {
      let steerX = 0;
      let steerY = 0;
      let alignX = 0;
      let alignY = 0;
      let centerX = 0;
      let centerY = 0;
      let neighbors = 0;
      const steer = { x: 0, y: 0 };

      for (const other of boids) {
        if (other === boid) continue;
        const dx = other.x - boid.x;
        const dy = other.y - boid.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 30 && distance > 0) {
          const force = (30 - distance) / 30;
          steerX -= (dx / distance) * force * 0.34;
          steerY -= (dy / distance) * force * 0.34;
        }

        if (distance < 104) {
          alignX += other.vx;
          alignY += other.vy;
          centerX += other.x;
          centerY += other.y;
          neighbors += 1;
        }
      }

      if (neighbors > 0) {
        alignX /= neighbors;
        alignY /= neighbors;
        centerX /= neighbors;
        centerY /= neighbors;
        steerX += (alignX - boid.vx) * 0.012 + (centerX - boid.x) * 0.00045;
        steerY += (alignY - boid.vy) * 0.012 + (centerY - boid.y) * 0.00045;
      }

      if (pointer.active) {
        const dx = pointer.x - boid.x;
        const dy = pointer.y - boid.y;
        const distance = Math.hypot(dx, dy);
        if (distance < config.pointerRadius && distance > 0) {
          const force = (config.pointerRadius - distance) / config.pointerRadius;
          steerX -= (dx / distance) * force * config.pointerForce;
          steerY -= (dy / distance) * force * config.pointerForce;
        }
      }

      for (const burst of bursts) {
        const dx = burst.x - boid.x;
        const dy = burst.y - boid.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= config.clickRadius || distance <= 0) continue;

        const age = Math.min((performance.now() - burst.startedAt) / config.clickDuration, 1);
        const force = Math.pow(1 - distance / config.clickRadius, 1.25) * Math.pow(1 - age, 2);
        steerX -= (dx / distance) * force * config.clickForce;
        steerY -= (dy / distance) * force * config.clickForce;
      }

      for (const rect of avoidRects) {
        addAvoidanceForce(boid, rect, config.avoidForce, steer);
      }

      steerX += steer.x;
      steerY += steer.y;

      const edge = 56;
      if (boid.x < edge) steerX += 0.012;
      if (boid.x > width - edge) steerX -= 0.012;
      if (boid.y < edge) steerY += 0.012;
      if (boid.y > height - edge) steerY -= 0.012;

      const steerSpeed = Math.hypot(steerX, steerY);
      if (steerSpeed > config.maxSteer) {
        steerX = (steerX / steerSpeed) * config.maxSteer;
        steerY = (steerY / steerSpeed) * config.maxSteer;
      }

      boid.vx = boid.vx * 0.985 + steerX;
      boid.vy = boid.vy * 0.985 + steerY;

      limitVelocity(boid);
      boid.x += boid.vx;
      boid.y += boid.vy;
    }

    function blendAngle(current, target, amount) {
      let delta = target - current;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      return current + delta * amount;
    }

    function drawBoid(boid, color) {
      boid.angle = blendAngle(boid.angle, Math.atan2(boid.vy, boid.vx), 0.18);
      ctx.save();
      ctx.translate(boid.x, boid.y);
      ctx.rotate(boid.angle);
      ctx.beginPath();
      ctx.moveTo(boid.size * 2.2, 0);
      ctx.lineTo(-boid.size, boid.size * 0.9);
      ctx.lineTo(-boid.size * 0.55, 0);
      ctx.lineTo(-boid.size, -boid.size * 0.9);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      if (destroyed) return;
      const accent = cssColor('--accent', '#3f91a2');
      const secondary = cssColor('--secondary', '#5f686b');

      measureAvoidRects();
      while (bursts.length && performance.now() - bursts[0].startedAt > config.clickDuration) {
        bursts.shift();
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = secondary;

      for (let i = 0; i < boids.length; i += 1) {
        const boid = boids[i];
        updateBoid(boid);

        for (let j = i + 1; j < boids.length; j += 1) {
          const other = boids[j];
          const distance = Math.hypot(other.x - boid.x, other.y - boid.y);
          if (distance < 74) {
            ctx.globalAlpha = (1 - distance / 74) * 0.08;
            ctx.beginPath();
            ctx.moveTo(boid.x, boid.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 0.72;
      for (const boid of boids) drawBoid(boid, accent);
      ctx.globalAlpha = 1;

      frameId = window.requestAnimationFrame(tick);
    }

    function onPointerMove(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY - config.topOffset;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function onPointerDown(event) {
      bursts.push({
        x: event.clientX,
        y: event.clientY - config.topOffset,
        startedAt: performance.now()
      });

      if (bursts.length > 5) bursts.shift();
    }

    function onVisibilityChange() {
      if (document.hidden && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      } else if (!document.hidden && !frameId) {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    function destroy() {
      destroyed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      ctx.clearRect(0, 0, width, height);
    }

    resize();
    tick();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return { destroy };
  }

  window.rybkrCreateBoidsCanvas = createBoidsCanvas;
})();
