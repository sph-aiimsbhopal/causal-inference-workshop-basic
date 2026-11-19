// Build the participant handbook: front matter, slides (2-up with notes space),
// the workbook, and back matter, merged into one A4 PDF whose page count is a
// multiple of four so it prints as a booklet.
//
//   python3 -m http.server 8765 &      (from the repo root)
//   node src/handbook-build.mjs        -> Causal-Inference-Handbook.pdf
import { chromium } from 'playwright-core';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

mkdirSync('handbook', { recursive: true });
const exe = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', process.env.CHROMIUM].find(p => p && existsSync(p));
const count = f => +execFileSync('python3', ['-c', `import pypdf,sys; print(len(pypdf.PdfReader(sys.argv[1]).pages))`, f]).toString();

execFileSync('node', ['src/handbook-slides.mjs', 'handbook/handbook-slides.pdf'], { stdio: 'inherit' });

const b = await chromium.launch(exe ? { executablePath: exe } : {});
async function pdf(url, out, setContent) {
  const p = await b.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await p.close();
}
await pdf('http://localhost:8765/workbook.html', 'handbook/handbook-workbook.pdf');

// front 5 + slides + workbook + back (4 + notes); pad notes to a multiple of four
execFileSync('python3', ['src/handbook-pages.py', '1'], { stdio: 'inherit' });
await pdf('http://localhost:8765/handbook/handbook-front.html', 'handbook/handbook-front.pdf');
const fixed = count('handbook/handbook-front.pdf') + count('handbook/handbook-slides.pdf') + count('handbook/handbook-workbook.pdf') + 4;
let notes = 2; while ((fixed + notes) % 4) notes++;
execFileSync('python3', ['src/handbook-pages.py', String(notes)], { stdio: 'inherit' });
await pdf('http://localhost:8765/handbook/handbook-front.html', 'handbook/handbook-front.pdf');
await pdf('http://localhost:8765/handbook/handbook-back.html', 'handbook/handbook-back.pdf');
await b.close();

execFileSync('python3', ['-c', `
import pypdf
w = pypdf.PdfWriter()
for f in ['front', 'slides', 'workbook', 'back']:
    for pg in pypdf.PdfReader(f'handbook/handbook-{f}.pdf').pages: w.add_page(pg)
w.add_metadata({'/Title': 'Causal Inference in Epidemiology: participant handbook'})
w.compress_identical_objects()
w.write('Causal-Inference-Handbook.pdf')
print('pages', len(w.pages))
`], { stdio: 'inherit' });
