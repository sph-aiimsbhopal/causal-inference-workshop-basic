// Step-by-step causal diagrams on reveal.js slides.
//
// <svg class="dag" data-dag="tb" data-steps='[{"add":["smk","tb","smk>tb"]},{"add":["alc","alc>smk","alc>tb"]},{"hl":"smk,alc,tb"},{"z":["alc"]}]'></svg>
//
// Step 0 shows on arrival; every further step is one click (a reveal fragment).
// "add" accumulates nodes ("id") and arrows ("a>b"); "z" (adjusted set) and "hl"
// (a path to highlight, comma-separated) hold until a later step changes them;
// "hl": "" clears the highlight. Without data-steps the whole diagram shows at once,
// with optional data-z and data-hl. When fragments are switched off (print), every
// diagram shows its final step.
(function () {
  'use strict';
  const items = [];

  function stateAt(steps, k) {
    const nodes = new Set(), edges = new Set();
    let z = [], hl = '';
    for (let i = 0; i <= k && i < steps.length; i++) {
      const s = steps[i];
      if (s.add === 'all' || s.add === '*') { s._all = true; }
      (Array.isArray(s.add) ? s.add : []).forEach(a => (a.includes('>') ? edges : nodes).add(a));
      (Array.isArray(s.remove) ? s.remove : []).forEach(a => { nodes.delete(a); edges.delete(a); });
      if (s.z) z = s.z;
      if (s.hl !== undefined) hl = s.hl;
    }
    return { nodes, edges, z, hl };
  }

  function draw(it, k) {
    const d = it.d;
    let show = null, Z, hl = null;
    if (it.steps) {
      const st = stateAt(it.steps, k);
      const all = it.steps.slice(0, k + 1).some(s => s._all);
      if (all) { d.nodes.forEach(n => st.nodes.add(n.id)); it.g.edges.forEach(e => st.edges.add(e[0] + '>' + e[1])); }
      show = { nodes: st.nodes, edges: st.edges };
      Z = new Set(st.z);
      if (st.hl) hl = it.g.pathInfo(st.hl.split(','), Z);
    } else {
      Z = new Set((it.svg.dataset.z || '').split(',').filter(Boolean));
      if (it.svg.dataset.hl) hl = it.g.pathInfo(it.svg.dataset.hl.split(','), Z);
    }
    DAG.render(it.svg, it.g, { x: d.x, y: d.y, Z, highlight: hl, show, width: 420, height: d.height, fontSize: +(it.svg.dataset.fs || 19), idp: 'p' + it.i + '_' });
  }

  function current(it) {
    if (!it.steps) return 0;
    if (window.Reveal && Reveal.getConfig && Reveal.getConfig().fragments === false) return it.steps.length - 1;
    return document.querySelectorAll(`.dagstep[data-for="${it.svg.id}"].visible`).length;
  }

  function setup() {
    document.querySelectorAll('svg.dag[data-dag]').forEach((svg, i) => {
      const d = window.DAGS[svg.dataset.dag];
      if (!d) { console.error('unknown diagram', svg.dataset.dag); return; }
      const g = DAG.create(d);
      svg.id = svg.id || 'dg' + i;
      const steps = svg.dataset.steps ? JSON.parse(svg.dataset.steps) : null;
      const it = { svg, d, g, steps, i };
      if (steps) {
        let after = svg;
        for (let k = 1; k < steps.length; k++) {
          const sp = document.createElement('span');
          sp.className = 'fragment dagstep';
          sp.dataset.for = svg.id;
          if (steps[k].fi !== undefined) sp.dataset.fragmentIndex = steps[k].fi;
          after.after(sp); after = sp;
        }
      }
      items.push(it);
      draw(it, 0);
    });
  }
  function refresh() { items.forEach(it => draw(it, current(it))); }

  window.DagSteps = { setup, refresh };
})();
