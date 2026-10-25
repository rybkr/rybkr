// Run the real animation with a seeded DOM fixture and a simulated clock.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function simulate(count, interval = 1000 / 60) {
  let seed = 42, click, queued, time = 0;
  const random = Object.create(Math);
  random.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const elements = Array.from({ length: count }, (_, i) => ({
    style: { setProperty() {}, removeProperty() {} },
    getAnimations: () => [], getAttribute: () => null, removeAttribute() {},
    rect: { left: 350, top: i === count - 1 ? 740 : 80 + i * 36, width: 150, height: 24 },
  }));
  const button = elements.at(-1);
  let selector;
  const main = { dataset: {}, querySelectorAll: (value) => {
    selector = value;
    return value.includes('a.runaway') ? elements : elements.slice(0, -1);
  }};
  vm.runInNewContext(fs.readFileSync('static/js/gravity.js', 'utf8'), {
    document: { addEventListener: (_, fn) => click = fn, querySelector: () => main,
      createRange: () => ({ selectNodeContents(el) { this.el = el; }, getBoundingClientRect() { return this.el.rect; } }) },
    window: { addEventListener() {}, removeEventListener() {} },
    innerWidth: 1000, innerHeight: 800, matchMedia: () => ({ matches: false }),
    requestAnimationFrame: fn => { queued = fn; return 1; }, cancelAnimationFrame() { queued = null; }, Math: random,
  });
  const event = { target: { closest: () => button }, preventDefault() {} };
  click(event);
  while (queued && time < 15000) {
    const fn = queued; queued = null; fn(time += interval);
  }
  assert.ok(time < 10000, `Pile should settle before 10 seconds (ran ${time.toFixed(0)}ms)`);
  assert.ok(selector.includes('a.runaway'), 'The trigger must join the simulation');
  assert.ok(button.style.transform?.includes('rotate'), 'The trigger must rotate');
  for (const el of elements) assert.ok(!/NaN|Infinity/.test(el.style.transform));
  const final = elements.map(el => el.style.transform);
  assert.ok(!queued, 'Settled pile must stop requesting frames');
  click(event);
  assert.ok(!('falling' in main.dataset), 'Reset restores normal layout');
  return { time: Math.round(time), final };
}
for (const count of [2, 14]) for (const interval of [1000 / 60, 1000 / 30, 1000 / 120]) {
  const result = simulate(count, interval);
  console.log(`${count} pieces at ${Math.round(1000 / interval)}fps settled in ${result.time}ms`);
}
