// Search box positions that keep arrows out of other boxes. Prints new coordinates.
// node src/layout-opt.cjs <dagname> <height> [fontSize] [iterations]
global.window = {}; require('../widgets/dag.js'); require('../widgets/dags.js');
const [,, name, Hs, FSs, ITs] = process.argv;
const H = +Hs, FS = +(FSs || 18), IT = +(ITs || 60000), W = 420, PAD = 6;
const src = name === 'capstone' ? Object.assign({ x: 'fuel', y: 'ari' }, window.CAPSTONE, { edges: window.CAPSTONE.candidates.filter(c => c.ours).map(c => c.e) }) : window.DAGS[name];
const nodes = src.nodes.map(n => { const L = String(n.label).split('\n'); return { id: n.id, x: n.x, y: n.y, w: Math.max(...L.map(l => l.length)) * FS * 0.56 + 22 + PAD * 2, h: L.length * FS * 1.15 + 14 + PAD * 2 }; });
const ix = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
const E = src.edges.map(([a, b]) => [ix[a], ix[b]]);
function cost(P) {
  let c = 0;
  for (let i = 0; i < P.length; i++) {
    const p = P[i];
    if (p.x - p.w / 2 < 2 || p.x + p.w / 2 > W - 2 || p.y - p.h / 2 < 2 || p.y + p.h / 2 > H - 2) c += 5000;
    for (let j = i + 1; j < P.length; j++) { const q = P[j]; if (Math.abs(p.x - q.x) < (p.w + q.w) / 2 + 8 && Math.abs(p.y - q.y) < (p.h + q.h) / 2 + 8) c += 5000; }
  }
  for (const [a, b] of E) {
    const A = P[a], B = P[b];
    for (let k = 0; k < P.length; k++) {
      if (k === a || k === b) continue; const C = P[k];
      for (let t = 0.03; t < 0.97; t += 0.02) { const x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t; if (Math.abs(x - C.x) < C.w / 2 && Math.abs(y - C.y) < C.h / 2) { c += 400; break; } }
    }
    const len = Math.hypot(B.x - A.x, B.y - A.y); c += len * 0.6; if (len < 70) c += (70 - len) * 20;
    if (B.y < A.y - 10) c += 60;   // prefer causes above effects
  }
  // edge-edge crossings, mild
  for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) {
    const [a, b] = E[i], [c2, d] = E[j]; if (a === c2 || a === d || b === c2 || b === d) continue;
    const p = P[a], q = P[b], r = P[c2], s = P[d];
    const o = (u, v, w) => Math.sign((v.x - u.x) * (w.y - u.y) - (v.y - u.y) * (w.x - u.x));
    if (o(p, q, r) !== o(p, q, s) && o(r, s, p) !== o(r, s, q)) c += 35;
  }
  const X = P[ix[src.x]], Y = P[ix[src.y]];
  c += Math.max(0, X.x - 140) * 4 + Math.max(0, 280 - Y.x) * 4;   // exposure left, outcome right
  return c;
}
let best = nodes.map(n => ({ ...n })), bc = cost(best), cur = best.map(n => ({ ...n })), cc = bc;
for (let it = 0; it < IT; it++) {
  const T = 200 * (1 - it / IT) + 1;
  const nx = cur.map(n => ({ ...n })); const k = Math.floor(Math.random() * nx.length);
  nx[k].x = Math.round(Math.min(W - nx[k].w / 2 - 4, Math.max(nx[k].w / 2 + 4, nx[k].x + (Math.random() - 0.5) * 120)) / 5) * 5;
  nx[k].y = Math.round(Math.min(H - nx[k].h / 2 - 4, Math.max(nx[k].h / 2 + 4, nx[k].y + (Math.random() - 0.5) * 120)) / 5) * 5;
  const c = cost(nx);
  if (c < cc || Math.random() < Math.exp((cc - c) / T)) { cur = nx; cc = c; if (c < bc) { best = nx.map(n => ({ ...n })); bc = c; } }
}
// report hits in best
let hits = 0;
for (const [a, b] of E) for (let k = 0; k < best.length; k++) { if (k === a || k === b) continue; const A = best[a], B = best[b], C = best[k]; for (let t = 0.03; t < 0.97; t += 0.01) { const x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t; if (Math.abs(x - C.x) < (C.w - 2 * PAD) / 2 && Math.abs(y - C.y) < (C.h - 2 * PAD) / 2) { hits++; console.error('  still crosses:', best[a].id, '->', best[b].id, 'over', best[k].id); break; } } }
console.log(JSON.stringify(Object.fromEntries(best.map(n => [n.id, [n.x, n.y]]))), 'cost', Math.round(bc), 'hits', hits);
