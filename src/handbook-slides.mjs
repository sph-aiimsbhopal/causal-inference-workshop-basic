// Handbook slides section: two slides to an A4 portrait page with ruled space for notes.
// Each module cover becomes a divider page (what you will learn, what to read).
// "Check yourself" closing slides and the tea slide are left out of print.
//
//   node src/handbook-slides.mjs <out.pdf> <deck> [<deck> ...]     (server on the repo root at :8765)
//
// At 186 mm a slide prints at 0.55 of its projected size: the 14 pt floor prints at about 7.7 pt.
import { chromium } from 'playwright-core';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';

const [out, ...decks] = process.argv.slice(2);
const RUN = process.env.HB_RUN || 'Causal Inference in Epidemiology &middot; a course for beginners &middot; AIIMS Bhopal';
const course = JSON.parse(readFileSync('src/course.json', 'utf8'));
const byN = Object.fromEntries(course.modules.map(m => [m.n, m]));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const exe = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', process.env.CHROMIUM].find(p => p && existsSync(p));
const work = mkdtempSync(join(tmpdir(), 'hb-'));
const b = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.25 });
const p = await ctx.newPage();
const blocks = [];
let label = '', shot = 0;
for (const deck of decks) {
  await p.goto(`http://localhost:8765/slides/${deck}.html?print`);
  await p.waitForFunction(() => window.Reveal && Reveal.isReady());
  await p.evaluate(() => Reveal.configure({ transition: 'none', backgroundTransition: 'none' }));
  await p.addStyleTag({ content: '.reveal .controls, .reveal .progress, .reveal .slide-number { display:none !important }' });
  await p.waitForTimeout(500);
  const info = await p.evaluate(() => Reveal.getSlides().map(s => ({
    cover: s.classList.contains('cover'), id: s.dataset.id || '', kicker: (s.querySelector('.kicker') || {}).textContent || '',
    h2: (s.querySelector('h2') || {}).textContent || '' })));
  for (let i = 0; i < info.length; i++) {
    const s = info[i];
    const mm = s.kicker.match(/^Module (\d+)/);
    if (s.cover && mm) { const m = byN[+mm[1]]; label = `Module ${m.n}`; blocks.push({ kind: 'divider', m }); continue; }
    if (s.id === 'tea' || s.id === 'title' || s.h2.trim() === 'Check yourself') continue;
    if (s.id) label = 'Workshop';
    await p.evaluate(n => Reveal.slide(n), i);
    await p.waitForTimeout(200);
    const file = join(work, `s${String(shot++).padStart(3, '0')}.png`);
    await p.screenshot({ path: file });
    blocks.push({ kind: 'slide', label, title: s.h2, file });
  }
}
await ctx.close();
execFileSync('python3', ['-c', `
from PIL import Image
import pathlib, sys
for f in sorted(pathlib.Path(sys.argv[1]).glob('*.png')):
    im = Image.open(f).convert('RGB')
    im.quantize(colors=128, method=Image.MEDIANCUT, dither=Image.NONE).save(f, optimize=True)
`, work], { stdio: 'inherit' });
for (const s of blocks) if (s.kind === 'slide') s.src = 'data:image/png;base64,' + readFileSync(s.file).toString('base64');

const slideBlock = s => `<div class="blk"><div class="cap">${esc(s.label)} &middot; ${esc(s.title)}</div><img src="${s.src}"><div class="lines">${'<i></i>'.repeat(8)}</div></div>`;
const dividerPage = d => `<div class="page div">
  <div class="dnum">${d.m.n}</div>
  <p class="dkick">Module ${d.m.n}</p>
  <h1>${esc(d.m.title)}</h1>
  <p class="dlede">${esc(d.m.lede)}</p>
  <p class="drow"><span>By the end you can:</span></p>
  <ul class="dlist">${d.m.learn.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  ${d.m.lab ? `<p class="drow"><span>Lab:</span> ${esc(d.m.lab[1])}</p>` : ''}
  <p class="drow"><span>Read in Modern Epidemiology, 4th ed.:</span> ${esc(d.m.rothman)}</p>
</div>`;
const pages = [];
for (let i = 0; i < blocks.length;) {
  if (blocks[i].kind === 'divider') { pages.push(dividerPage(blocks[i])); i++; continue; }
  const a = blocks[i], nx = blocks[i + 1], bb = nx && nx.kind === 'slide' ? nx : null;
  pages.push(`<div class="page">${slideBlock(a)}${bb ? slideBlock(bb) : ''}<div class="run"><span>${RUN}</span><span>${esc(a.label)}</span></div></div>`);
  i += bb ? 2 : 1;
}
const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Handbook slides</title><style>
  @page { size: A4 portrait; margin: 12mm 12mm 14mm; }
  * { box-sizing: border-box }
  body { margin:0; font: 10pt/1.4 Arial, Helvetica, sans-serif; color:#10141A; -webkit-print-color-adjust:exact; print-color-adjust:exact }
  .page { height: 271mm; display:flex; flex-direction:column; page-break-after:always; position:relative }
  .page:last-child { page-break-after:auto }
  .blk { flex:0 0 130mm; display:flex; flex-direction:column }
  .cap { font-size:7.5pt; letter-spacing:.08em; text-transform:uppercase; color:#7A8394; margin-bottom:1.2mm; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
  .blk img { width:186mm; height:104.6mm; display:block; border:.4pt solid #C9CEDA }
  .lines { flex:1 1 auto; margin-top:2mm; overflow:hidden }
  .lines i { display:block; height:5.75mm; border-bottom:.15mm solid #BFC6D4 }
  .run { flex:0 0 auto; margin-top:auto; font-size:7.5pt; color:#9AA1B0; display:flex; justify-content:space-between; padding-top:2mm }
  .div { justify-content:center }
  .div .dnum { font-size:64pt; font-weight:700; color:#162a6c; line-height:1 }
  .div .dkick { font-size:9pt; letter-spacing:.14em; text-transform:uppercase; color:#7A8394; margin:2mm 0 0 }
  .div h1 { font-size:26pt; line-height:1.15; margin:.15em 0 .5em; color:#162a6c; font-weight:700 }
  .div .dlede { font-size:13pt; line-height:1.45; max-width:150mm; margin:0 0 1.2em }
  .div .drow { font-size:10.5pt; color:#222833; border-left:3pt solid #162a6c; padding-left:5mm; margin:0 0 .6em; max-width:160mm }
  .div .drow span { font-weight:700 }
  .div .dlist { font-size:10.5pt; margin:0 0 1em 10mm; padding-left:4mm; max-width:150mm }
  .div .dlist li { margin-bottom:1.5mm }
</style></head><body>${pages.join('\n')}</body></html>`;
const ctx2 = await b.newContext({ viewport: { width: 794, height: 1123 } });
const q = await ctx2.newPage();
await q.setContent(doc, { waitUntil: 'load' });
await q.emulateMedia({ media: 'print' });
await q.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await b.close();
rmSync(work, { recursive: true, force: true });
console.log(`handbook slides: ${blocks.filter(x => x.kind === 'slide').length} slides, ${pages.length} pages -> ${out}`);
