// Flags arrows that pass through a box they do not connect. node src/layoutcheck.cjs [fontSize]
global.window = {}; require('../widgets/dag.js'); require('../widgets/dags.js');
const FS = +(process.argv[2] || 18), PAD = 6;
const all = Object.assign({}, window.DAGS, { capstone: window.CAPSTONE && Object.assign({ x: 'fuel', y: 'ari' }, window.CAPSTONE, { edges: window.CAPSTONE.candidates.filter(c => c.ours).map(c => c.e) }) });
let bad = 0;
for (const [k, d] of Object.entries(all)) {
  const box = {};
  for (const n of d.nodes) { const L = String(n.label).split('\n'); box[n.id] = { x: n.x, y: n.y, w: Math.max(...L.map(l => l.length)) * FS * 0.56 + 22 + PAD * 2, h: L.length * FS * 1.15 + 14 + PAD * 2 }; }
  for (const [a, b] of d.edges) {
    const A = box[a], B = box[b];
    for (const [id, c] of Object.entries(box)) {
      if (id === a || id === b) continue;
      let hit = false;
      for (let t = 0.02; t < 0.98; t += 0.01) { const x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t; if (Math.abs(x - c.x) < c.w / 2 && Math.abs(y - c.y) < c.h / 2) { hit = true; break; } }
      if (hit) { bad++; console.log(`${k}: ${a}->${b} crosses ${id}`); }
    }
  }
  for (const [i, p] of Object.entries(box)) for (const [j, q] of Object.entries(box)) if (i < j && Math.abs(p.x - q.x) < (p.w + q.w) / 2 && Math.abs(p.y - q.y) < (p.h + q.h) / 2) { bad++; console.log(`${k}: boxes ${i} and ${j} overlap`); }
}
console.log(bad ? `${bad} problems` : 'no crossings');
