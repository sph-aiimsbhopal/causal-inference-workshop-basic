// Small DAG engine shared by the labs: paths, d-separation, backdoor criterion,
// minimal adjustment sets, and an SVG renderer that works on phones.
(function () {
  'use strict';

  function create(spec) {
    const nodes = spec.nodes.map(n => Object.assign({ observed: true }, n));
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
    let edges = spec.edges.map(e => e.slice());

    const has = (a, b) => edges.some(e => e[0] === a && e[1] === b);
    const parents = v => edges.filter(e => e[1] === v).map(e => e[0]);
    const children = v => edges.filter(e => e[0] === v).map(e => e[1]);
    const neighbours = v => [...new Set(parents(v).concat(children(v)))];

    function reach(v, step) {
      const seen = new Set(), stack = [v];
      while (stack.length) { const u = stack.pop(); for (const w of step(u)) if (!seen.has(w)) { seen.add(w); stack.push(w); } }
      return seen;
    }
    const descendants = v => reach(v, children);
    const ancestors = v => reach(v, parents);

    function isAcyclic() { return nodes.every(n => !descendants(n.id).has(n.id)); }

    // All simple paths between x and y, ignoring arrow direction.
    function paths(x, y, cap) {
      const out = [], max = cap || 5000;
      (function walk(path) {
        if (out.length >= max) return;
        const u = path[path.length - 1];
        if (u === y) { out.push(path.slice()); return; }
        for (const w of neighbours(u)) if (!path.includes(w)) { path.push(w); walk(path); path.pop(); }
      })([x]);
      return out.sort((a, b) => a.length - b.length);
    }

    // Describe one path given the adjustment set Z (a Set of ids).
    function pathInfo(p, Z) {
      const x = p[0], y = p[p.length - 1];
      const arrows = []; // for each edge i: '>' means p[i] -> p[i+1], '<' means p[i] <- p[i+1]
      for (let i = 0; i < p.length - 1; i++) arrows.push(has(p[i], p[i + 1]) ? '>' : '<');
      const causal = arrows.every(a => a === '>');
      const backdoor = arrows[0] === '<';
      const kind = causal ? 'causal' : backdoor ? 'backdoor' : 'other';
      const blockedBy = [], openedBy = [], colliders = [];
      for (let i = 1; i < p.length - 1; i++) {
        const v = p[i], collider = arrows[i - 1] === '>' && arrows[i] === '<';
        if (collider) {
          colliders.push(v);
          const opener = Z.has(v) ? v : [...descendants(v)].find(d => Z.has(d));
          if (opener) openedBy.push({ collider: v, via: opener }); else blockedBy.push({ node: v, why: 'collider' });
        } else if (Z.has(v)) blockedBy.push({ node: v, why: 'adjusted' });
      }
      return { path: p, arrows, kind, open: blockedBy.length === 0, blockedBy, openedBy, colliders, x, y };
    }

    function text(info) {
      let s = info.path[0];
      for (let i = 0; i < info.arrows.length; i++) s += (info.arrows[i] === '>' ? ' → ' : ' ← ') + info.path[i + 1];
      return s;
    }

    // Backdoor criterion for the total effect of x on y.
    function check(x, y, Z) {
      const dx = descendants(x);
      const badDesc = [...Z].filter(z => dx.has(z));
      const all = paths(x, y).map(p => pathInfo(p, Z));
      const openNonCausal = all.filter(i => i.kind !== 'causal' && i.open);
      const blockedCausal = all.filter(i => i.kind === 'causal' && !i.open);
      const unobservedInZ = [...Z].filter(z => byId[z] && byId[z].observed === false);
      const valid = badDesc.length === 0 && openNonCausal.length === 0 && unobservedInZ.length === 0;
      return { valid, badDesc, openNonCausal, blockedCausal, unobservedInZ, all };
    }

    // d-separation by the moralised ancestral graph; fast enough for subset search.
    function dsep(x, y, Z, E) {
      const ed = E || edges;
      const par = v => ed.filter(e => e[1] === v).map(e => e[0]);
      const keep = new Set([x, y, ...Z]);
      const stack = [...keep];
      while (stack.length) { const u = stack.pop(); for (const p of par(u)) if (!keep.has(p)) { keep.add(p); stack.push(p); } }
      const adj = new Map([...keep].map(v => [v, new Set()]));
      const link = (a, b) => { adj.get(a).add(b); adj.get(b).add(a); };
      for (const v of keep) {
        const ps = par(v).filter(p => keep.has(p));
        for (const p of ps) link(p, v);
        for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) link(ps[i], ps[j]);
      }
      const seen = new Set([x]), q = [x];
      while (q.length) { const u = q.shift(); if (u === y) return false; for (const w of adj.get(u)) if (!seen.has(w) && !Z.has(w)) { seen.add(w); q.push(w); } }
      return true;
    }
    function validFast(x, y, Z) {
      const dx = descendants(x);
      if ([...Z].some(z => dx.has(z) || (byId[z] && byId[z].observed === false))) return false;
      return dsep(x, y, Z, edges.filter(e => e[0] !== x));
    }

    function minimalSets(x, y, limit) {
      const dx = descendants(x);
      const cand = nodes.filter(n => n.id !== x && n.id !== y && n.observed && !dx.has(n.id)).map(n => n.id);
      const found = [];
      const max = Math.min(cand.length, limit || 6);
      for (let k = 0; k <= max; k++) {
        (function choose(start, cur) {
          if (cur.length === k) {
            if (found.some(f => f.every(v => cur.includes(v)))) return;
            if (validFast(x, y, new Set(cur))) found.push(cur.slice());
            return;
          }
          for (let i = start; i < cand.length; i++) { cur.push(cand[i]); choose(i + 1, cur); cur.pop(); }
        })(0, []);
        if (found.length > 12) break;
      }
      return found;
    }

    return {
      nodes, byId, get edges() { return edges; }, set edges(e) { edges = e; },
      has, parents, children, descendants, ancestors, isAcyclic, paths, pathInfo, text, check, minimalSets, dsep, validFast,
      label: id => (byId[id] ? byId[id].label : id)
    };
  }

  // ---------- Renderer ----------
  const NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // opts: { x, y, Z:Set, highlight: pathInfo|null, onTap(id), width, height, fontSize }
  function render(svg, g, opts) {
    const W = opts.width || 640, H = opts.height || 360, FS = opts.fontSize || 17;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const defs = el('defs', {}, svg);
    for (const [id, cls] of [['ah', 'edge'], ['ah-on', 'edge on'], ['ah-bad', 'edge bad'], ['ah-good', 'edge good']]) {
      const m = el('marker', { id: (opts.idp || '') + id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 14, markerHeight: 14, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'ah ' + cls }, m);
    }
    const box = {};
    for (const n of g.nodes) {
      const lines = String(n.label).split('\n');
      const w = Math.max(...lines.map(l => l.length)) * FS * 0.56 + 22;
      const h = lines.length * FS * 1.15 + 14;
      box[n.id] = { cx: n.x, cy: n.y, w, h, lines };
    }
    // edge endpoints on box borders
    function clip(b, tx, ty) {
      const dx = tx - b.cx, dy = ty - b.cy;
      const sx = Math.abs(dx) > 0 ? (b.w / 2) / Math.abs(dx) : Infinity;
      const sy = Math.abs(dy) > 0 ? (b.h / 2) / Math.abs(dy) : Infinity;
      const s = Math.min(sx, sy);
      return [b.cx + dx * s, b.cy + dy * s];
    }
    const hl = opts.highlight;
    const onEdge = new Map();
    if (hl) for (let i = 0; i < hl.path.length - 1; i++) {
      const a = hl.path[i], b = hl.path[i + 1];
      onEdge.set(a + '>' + b, true); onEdge.set(b + '>' + a, true);
    }
    const hlClass = hl ? (hl.kind === 'causal' ? (hl.open ? 'good' : 'on') : (hl.open ? 'bad' : 'on')) : '';
    const eg = el('g', {}, svg);
    for (const [a, b] of g.edges) {
      const A = box[a], B = box[b];
      if (!A || !B) continue;
      const [x1, y1] = clip(A, B.cx, B.cy), [x2, y2] = clip(B, A.cx, A.cy);
      const on = onEdge.has(a + '>' + b);
      const cls = 'edge' + (on ? ' ' + hlClass : '') + (on && hl && !hl.open ? ' blocked' : '');
      el('line', { x1, y1, x2, y2, class: cls, 'marker-end': `url(#${(opts.idp || '') + (on ? 'ah-' + (hlClass || 'on') : 'ah')})` }, eg);
    }
    const ng = el('g', {}, svg);
    for (const n of g.nodes) {
      const b = box[n.id];
      const role = n.id === opts.x ? 'expo' : n.id === opts.y ? 'outc' : '';
      const adj = opts.Z && opts.Z.has(n.id);
      const onPath = hl && hl.path.includes(n.id);
      const gg = el('g', { class: 'node ' + role + (adj ? ' adj' : '') + (n.observed === false ? ' unobs' : '') + (onPath ? ' onpath' : ''), tabindex: opts.onTap ? 0 : -1, role: opts.onTap ? 'button' : 'img', 'aria-label': n.label.replace('\n', ' ') + (adj ? ', adjusted' : '') }, ng);
      el('rect', { x: b.cx - b.w / 2, y: b.cy - b.h / 2, width: b.w, height: b.h, rx: adj ? 2 : 10 }, gg);
      if (adj) el('rect', { class: 'inner', x: b.cx - b.w / 2 + 4, y: b.cy - b.h / 2 + 4, width: b.w - 8, height: b.h - 8, rx: 1 }, gg);
      b.lines.forEach((l, i) => {
        const t = el('text', { x: b.cx, y: b.cy + (i - (b.lines.length - 1) / 2) * FS * 1.15 + FS * 0.35, 'text-anchor': 'middle', 'font-size': FS }, gg);
        t.textContent = l;
      });
      if (opts.onTap && n.id !== opts.x && n.id !== opts.y) {
        gg.style.cursor = 'pointer';
        gg.addEventListener('click', () => opts.onTap(n.id));
        gg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onTap(n.id); } });
      }
    }
  }

  window.DAG = { create, render };
})();
