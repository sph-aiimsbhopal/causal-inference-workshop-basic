// Self-check questions on a module page. Options are shuffled on every visit so the
// position of the right answer tells you nothing. The explanation appears only after
// you commit to an answer.
(function () {
  const data = JSON.parse(document.getElementById('checkdata').textContent);
  const box = document.getElementById('checks');
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  data.forEach((q, qi) => {
    const f = document.createElement('fieldset');
    f.className = 'chk';
    const order = shuffle(q.o.map((_, i) => i));
    f.innerHTML = `<legend>${qi + 1}. ${q.q}</legend>` +
      order.map(i => `<label><input type="radio" name="c${qi}" value="${i}"><span>${q.o[i]}</span></label>`).join('') +
      `<div class="row"><button type="button" class="act">Check</button></div><p class="exp" hidden></p>`;
    const btn = f.querySelector('button'), exp = f.querySelector('.exp');
    btn.onclick = () => {
      const pick = f.querySelector('input:checked');
      if (!pick) { exp.hidden = false; exp.textContent = 'Choose an answer first.'; return; }
      f.querySelectorAll('label').forEach(l => {
        const v = +l.querySelector('input').value;
        l.classList.toggle('right', v === q.a);
        l.classList.toggle('wrong', v === +pick.value && v !== q.a);
      });
      exp.hidden = false;
      exp.innerHTML = (+pick.value === q.a ? '<b>Right.</b> ' : '<b>Not quite.</b> ') + q.e;
      f.querySelectorAll('input').forEach(x => x.disabled = true);
      btn.disabled = true;
    };
    box.appendChild(f);
  });
})();
