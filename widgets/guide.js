// Guided steps for the labs: one card at a time, Next only after the step is done.
//
// Guide.run(el, steps, { onDone })
// step = {
//   title, html,                         what the student reads
//   enter(): void,                       sets the lab view for this step
//   ask: { type: 'number', answer, tol, prompt, after }   type a number
//      | { type: 'choice', prompt, options: [..], answer, after }   pick one
//      | { type: 'do', prompt, check(): bool, after }       do something in the lab, then press Check
//   after: html shown once the step is answered (or straight away if no ask)
// }
(function () {
  'use strict';
  function run(el, steps, opts) {
    opts = opts || {};
    let k = 0;
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    function show() {
      const s = steps[k];
      if (s.enter) s.enter();
      const a = s.ask;
      let askHtml = '';
      if (a && a.type === 'number') askHtml = `<p class="gq">${a.prompt}</p><div class="row"><input class="gnum" type="text" inputmode="decimal" aria-label="Your answer"><button class="act" type="button" data-g="check">Check</button></div>`;
      if (a && a.type === 'choice') {
        const order = shuffle(a.options.map((_, i) => i));
        askHtml = `<p class="gq">${a.prompt}</p><div class="gopts">` + order.map(i => `<label><input type="radio" name="gopt" value="${i}"><span>${a.options[i]}</span></label>`).join('') + `</div><div class="row"><button class="act" type="button" data-g="check">Check</button></div>`;
      }
      if (a && a.type === 'do') askHtml = `<p class="gq">${a.prompt}</p><div class="row"><button class="act" type="button" data-g="check">Check</button></div>`;
      el.innerHTML = `<div class="gstep"><p class="label">Step ${k + 1} of ${steps.length}</p><h2>${s.title}</h2>${s.html || ''}${askHtml}<div class="gfb" aria-live="polite"></div>
        <div class="row gnav">${k ? '<button class="act ghost" type="button" data-g="back">← Back</button>' : ''}<button class="act" type="button" data-g="next" ${a ? 'disabled' : ''}>${k + 1 < steps.length ? 'Next →' : 'Finish'}</button></div></div>`;
      const fb = el.querySelector('.gfb'), next = el.querySelector('[data-g="next"]');
      const done = ok => {
        fb.innerHTML = (ok ? '<p class="claim good">' : '<p class="claim warn">') + (ok ? (a.after || s.after || 'Right.') : (a.hint || 'Not yet. Look again and try once more.')) + '</p>';
        if (ok) { next.disabled = false; el.querySelectorAll('input').forEach(x => x.disabled = true); el.querySelector('[data-g="check"]').disabled = true; }
      };
      if (!a && s.after) fb.innerHTML = `<p class="claim">${s.after}</p>`;
      const chk = el.querySelector('[data-g="check"]');
      if (chk) chk.onclick = () => {
        if (a.type === 'number') {
          const v = parseFloat(String(el.querySelector('.gnum').value).replace(',', '.'));
          if (isNaN(v)) { fb.innerHTML = '<p class="claim warn">Type a number first.</p>'; return; }
          done(Math.abs(v - a.answer) <= (a.tol ?? 0.05));
        } else if (a.type === 'choice') {
          const p = el.querySelector('input[name="gopt"]:checked');
          if (!p) { fb.innerHTML = '<p class="claim warn">Pick an answer first.</p>'; return; }
          done(+p.value === a.answer);
        } else done(!!a.check());
      };
      next.onclick = () => { if (k + 1 < steps.length) { k++; show(); el.scrollIntoView({ block: 'start', behavior: 'smooth' }); } else if (opts.onDone) opts.onDone(); };
      const back = el.querySelector('[data-g="back"]');
      if (back) back.onclick = () => { k--; show(); };
      if (opts.onStep) opts.onStep(k);
    }
    show();
    return { go: i => { k = i; show(); } };
  }
  window.Guide = { run };
})();
