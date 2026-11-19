// Participant handbook, slides section: two slides to an A4 portrait page, each the
// full width of the text block with ruled space beneath to write in, and a divider
// page before each session. Same layout as the economic evaluation workshop kit.
//
//   node src/handbook-slides.mjs [outfile]      (static server on the repo root at :8765)
//
// At 186 mm the slide prints at 0.55 of its projected size, so the deck's 14 pt
// floor prints at about 7.7 pt and body text at about 11 pt.
import { chromium } from 'playwright-core';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';

const out = process.argv[2] || 'handbook/handbook-slides.pdf';
const DECK = 'causal-inference';
const RUN = 'Causal Inference in Epidemiology &middot; 12th SCZ IAPSMCon pre-conference workshop &middot; Gwalior, 26 November 2026';

// session label, title, first and last slide (1-based, inclusive), what it adds, where to read next, what follows
const SESSIONS = [
  ['Opening', 'Two studies, opposite answers', 1, 4,
   'Two studies of the same hormones gave opposite answers about heart disease. Hold on to the puzzle; by the end of the workshop you will be able to draw why.',
   'Chapter 2, Causal Inference and Scientific Reasoning', 'The before quiz, on your phone or on workbook page 1.'],
  ['1', 'Thinking causally', 5, 11,
   'What a causal effect is: two potential outcomes for every person, only one ever seen. Exchangeability, positivity and consistency. Rothman’s sufficient-component causes.',
   'Chapters 2, 3 and 5', 'Exercise 1, smoking and TB deaths in Tamil Nadu: workbook page 2 and Lab 1.'],
  ['2', 'Causal diagrams and the structure of bias', 12, 21,
   'Arrows as assumptions. Forks, chains and colliders. Confounding as an open back-door path, selection bias as conditioning on a collider, and measurement error drawn the same way.',
   'Chapters 3, 12, 13 and 14', 'Exercises 2 and 3, hormone therapy and the birth weight paradox: workbook pages 3 and 4, Labs 2 and 3.'],
  ['3', 'From diagram to adjustment', 23, 28,
   'The back-door rule in two lines. Four things not to adjust for. A practical rule when the diagram is uncertain. Why one model answers only one causal question.',
   'Chapter 12; then 18 and 27', 'Group exercise, cooking fuel and childhood ARI in NFHS-4: workbook page 5 and Lab 4.'],
  ['Close', 'Your own causal question', 29, 33,
   'Write the trial you wish you could run, then make your observational study imitate it. Back to the hormones, with an answer.',
   'Chapter 25; Hernán and Robins, Causal Inference: What If', 'The after quiz, and workbook page 6 to take home.'],
];

const esc = s => String(s).replace(/&(?![a-z#0-9]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const exe = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', process.env.CHROMIUM].find(p => p && existsSync(p));
const work = mkdtempSync(join(tmpdir(), 'hb-'));
const b = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.25 });
const p = await ctx.newPage();
await p.goto(`http://localhost:8765/slides/${DECK}.html`);
await p.waitForFunction(() => window.Reveal && Reveal.isReady());
await p.evaluate(() => Reveal.configure({ transition: 'none', backgroundTransition: 'none' }));
await p.addStyleTag({ content: '.reveal .controls, .reveal .progress, .reveal .slide-number { display:none !important }' });
await p.waitForTimeout(600);

const blocks = [];
for (const [sess, title, first, last, adds, read, next] of SESSIONS) {
  blocks.push({ kind: 'divider', sess, title, adds, read, next, slides: last - first + 1 });
  for (let n = first; n <= last; n++) {
    await p.evaluate(i => Reveal.slide(i), n - 1);
    await p.waitForTimeout(220);
    const file = join(work, `s${String(n).padStart(2, '0')}.png`);
    await p.screenshot({ path: file });
    blocks.push({ kind: 'slide', sess, n, file });
  }
}
await ctx.close();

// Flat colour and antialiased text: a 128-colour palette is indistinguishable in print
// and keeps the file small enough to pass through the device bridge.
execFileSync('python3', ['-c', `
from PIL import Image
import pathlib, sys
for f in sorted(pathlib.Path(sys.argv[1]).glob('*.png')):
    im = Image.open(f).convert('RGB')
    im.quantize(colors=128, method=Image.MEDIANCUT, dither=Image.NONE).save(f, optimize=True)
`, work], { stdio: 'inherit' });
for (const s of blocks) if (s.kind === 'slide') s.src = 'data:image/png;base64,' + readFileSync(s.file).toString('base64');

const slideBlock = s => `<div class="blk"><div class="cap">${s.sess === 'Opening' || s.sess === 'Close' ? s.sess : 'Session ' + s.sess} &middot; slide ${s.n}</div><img src="${s.src}"><div class="lines"></div></div>`;
const dividerPage = d => `<div class="page div">
  <div class="dnum">${d.sess.length > 2 ? '' : d.sess}</div>
  <p class="dkick">${d.sess.length > 2 ? d.sess : 'Session ' + d.sess}</p>
  <h1>${esc(d.title)}</h1>
  <p class="dlede">${esc(d.adds)}</p>
  <p class="drow"><span>Read later in Modern Epidemiology, 4th ed.:</span> ${esc(d.read)}</p>
  <p class="drow"><span>Then:</span> ${esc(d.next)}</p>
  <p class="dslides">${d.slides} slides follow, two to a page, with room for your notes.</p>
</div>`;

const pages = [];
for (let i = 0; i < blocks.length;) {
  if (blocks[i].kind === 'divider') { pages.push(dividerPage(blocks[i])); i++; continue; }
  const a = blocks[i], nx = blocks[i + 1], bb = nx && nx.kind === 'slide' ? nx : null;
  pages.push(`<div class="page">${slideBlock(a)}${bb ? slideBlock(bb) : ''}<div class="run"><span>${RUN}</span><span>slides</span></div></div>`);
  i += bb ? 2 : 1;
}

const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Handbook slides</title><style>
  @page { size: A4 portrait; margin: 12mm 12mm 14mm; }
  * { box-sizing: border-box }
  body { margin:0; font: 10pt/1.4 Arial, Helvetica, sans-serif; color:#10141A; -webkit-print-color-adjust:exact; print-color-adjust:exact }
  .page { height: 271mm; display:flex; flex-direction:column; page-break-after:always; position:relative }
  .page:last-child { page-break-after:auto }
  .blk { flex:0 0 130mm; display:flex; flex-direction:column }
  .cap { font-size:7.5pt; letter-spacing:.08em; text-transform:uppercase; color:#7A8394; margin-bottom:1.2mm }
  .blk img { width:186mm; height:104.6mm; display:block; border:.4pt solid #C9CEDA }
  .lines { flex:1 1 auto; margin-top:2mm; background:repeating-linear-gradient(to bottom, transparent 0 5.6mm, #BFC6D4 5.6mm 5.75mm) }
  .run { flex:0 0 auto; margin-top:auto; font-size:7.5pt; color:#9AA1B0; display:flex; justify-content:space-between; padding-top:2mm }
  .div { justify-content:center }
  .div .dnum { font-size:64pt; font-weight:700; color:#162a6c; line-height:1 }
  .div .dkick { font-size:9pt; letter-spacing:.14em; text-transform:uppercase; color:#7A8394; margin:2mm 0 0 }
  .div h1 { font-size:26pt; line-height:1.15; margin:.15em 0 .5em; color:#162a6c; font-weight:700 }
  .div .dlede { font-size:13pt; line-height:1.45; max-width:150mm; margin:0 0 1.2em }
  .div .drow { font-size:10.5pt; color:#222833; border-left:3pt solid #162a6c; padding-left:5mm; margin:0 0 .9em; max-width:160mm }
  .div .drow span { font-weight:700 }
  .div .dslides { font-size:9.5pt; color:#7A8394; margin:.8em 0 0 }
</style></head><body>${pages.join('\n')}</body></html>`;

const ctx2 = await b.newContext({ viewport: { width: 794, height: 1123 } });
const q = await ctx2.newPage();
await q.setContent(doc, { waitUntil: 'load' });
await q.emulateMedia({ media: 'print' });
await q.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await b.close();
rmSync(work, { recursive: true, force: true });
console.log(`handbook slides: ${blocks.filter(x => x.kind === 'slide').length} slides, ${pages.length} pages -> ${out}`);
