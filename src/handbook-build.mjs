// Build both handbooks: the workshop path and the full course. Each is front matter,
// slides (2-up with notes space, a divider per module), the workbook, and back matter,
// merged into one A4 PDF whose page count is a multiple of four (booklet printing).
//
//   python3 src/build.py && python3 -m http.server 8765 &   (from the repo root)
//   node src/handbook-build.mjs
//   -> Causal-Inference-Handbook.pdf (workshop) and Causal-Inference-Course-Handbook.pdf
import { chromium } from 'playwright-core';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';

mkdirSync('handbook', { recursive: true });
const exe = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', process.env.CHROMIUM].find(p => p && existsSync(p));
const count = f => +execFileSync('python3', ['-c', 'import pypdf,sys; print(len(pypdf.PdfReader(sys.argv[1]).pages))', f]).toString();
const course = JSON.parse(readFileSync('src/course.json', 'utf8'));
const readyDecks = course.modules.filter(m => m.status === 'ready' && existsSync(`slides/${m.id}-${m.slug}.html`)).map(m => `${m.id}-${m.slug}`);

const b = await chromium.launch(exe ? { executablePath: exe } : {});
async function pdf(url, out) {
  const p = await b.newPage();
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(300);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await p.close();
}
await pdf('http://localhost:8765/workbook.html?workshop', 'handbook/workbook-workshop.pdf');
await pdf('http://localhost:8765/workbook.html', 'handbook/workbook-course.pdf');

const variants = [
  { v: 'workshop', decks: ['workshop'], out: 'Causal-Inference-Handbook.pdf', run: 'Causal Inference in Epidemiology &middot; workshop handbook &middot; Gwalior, 26 November 2026' },
  { v: 'course', decks: readyDecks, out: 'Causal-Inference-Course-Handbook.pdf', run: 'Causal Inference in Epidemiology &middot; a course for beginners &middot; AIIMS Bhopal' },
];
for (const V of variants) {
  execFileSync('node', ['src/handbook-slides.mjs', `handbook/slides-${V.v}.pdf`, ...V.decks], { stdio: 'inherit', env: { ...process.env, HB_RUN: V.run } });
  execFileSync('python3', ['src/handbook-pages.py', V.v, '1'], { stdio: 'inherit' });
  await pdf(`http://localhost:8765/handbook/handbook-front-${V.v}.html`, `handbook/front-${V.v}.pdf`);
  await pdf(`http://localhost:8765/handbook/handbook-back-${V.v}.html`, `handbook/back-${V.v}.pdf`);
  const fixed = count(`handbook/front-${V.v}.pdf`) + count(`handbook/slides-${V.v}.pdf`) + count(`handbook/workbook-${V.v}.pdf`) + count(`handbook/back-${V.v}.pdf`) - 1;
  let notes = 2; while ((fixed + notes) % 4) notes++;
  execFileSync('python3', ['src/handbook-pages.py', V.v, String(notes)], { stdio: 'inherit' });
  await pdf(`http://localhost:8765/handbook/handbook-back-${V.v}.html`, `handbook/back-${V.v}.pdf`);
  execFileSync('python3', ['-c', `
import pypdf, sys
v, out = sys.argv[1], sys.argv[2]
w = pypdf.PdfWriter()
for f in [f'handbook/front-{v}.pdf', f'handbook/slides-{v}.pdf', f'handbook/workbook-{v}.pdf', f'handbook/back-{v}.pdf']:
    for pg in pypdf.PdfReader(f).pages: w.add_page(pg)
w.add_metadata({'/Title': 'Causal Inference in Epidemiology: ' + ('workshop handbook' if v == 'workshop' else 'course handbook')})
w.compress_identical_objects()
w.write(out)
print(out, 'pages', len(w.pages))
`, V.v, V.out], { stdio: 'inherit' });
}
await b.close();
