#!/usr/bin/env python3
"""Build the course from src/course.py and src/decks/*.html.

    python3 src/build.py

Writes:
  slides/<id>-<slug>.html   one reveal.js deck per ready module (cover and closing slide added here)
  slides/workshop.html      the workshop path: slides marked data-core, in the order of course.WORKSHOP
  modules/<id>-<slug>.html  one page per module: what you will learn, slides, lab, self-check, reading
  index.html                the course map

Slide sources hold only <section> elements. Mark a section data-core to put it on the workshop path;
the module cover is always on it. Every slide addresses the student; notes for the teacher go in
<aside class="notes">.
"""
import html, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))
from course import MODULES, WORKSHOP, SITE  # noqa: E402

BYID = {m["id"]: m for m in MODULES}
READY = [m for m in MODULES if m["status"] == "ready"]
esc = html.escape


def deck_name(m):
    return f"{m['id']}-{m['slug']}.html"


def page_name(m):
    return f"{m['id']}-{m['slug']}.html"


DECK = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>{title}</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="../vendor/reveal.js/dist/reveal.css">
<link rel="stylesheet" href="../assets/css/tokens.css">
<link rel="stylesheet" href="../assets/css/slides.css">
<link rel="stylesheet" href="../assets/css/deck.css">
</head>
<body>
<div class="reveal"><div class="slides">
{sections}
</div></div>
<script src="../vendor/reveal.js/dist/reveal.js"></script>
<script src="../vendor/reveal.js/plugin/notes/notes.js"></script>
<script src="../widgets/dag.js"></script>
<script src="../widgets/dags.js"></script>
<script src="../widgets/dagsteps.js"></script>
<script>
  DagSteps.setup();
  const printAll = new URLSearchParams(location.search).has('print');
  Reveal.initialize({{
    width: 1280, height: 720, margin: 0, center: false, transition: 'fade',
    hash: true, slideNumber: 'c/t', fragments: !printAll, plugins: [RevealNotes]
  }});
  ['ready', 'slidechanged', 'fragmentshown', 'fragmenthidden'].forEach(e => Reveal.on(e, DagSteps.refresh));
</script>
</body>
</html>
"""


def cover(m, where):
    nxt = "Use the arrow keys or swipe. Each click adds one step." if where == "module" else ""
    return f"""<section class="cover" data-core>
  <p class="kicker">Module {m['n']} · Causal inference for beginners</p>
  <h1>{esc(m['title'])}</h1>
  <p class="lede dim">{esc(m['lede'])}</p>
  <p class="small faint">{nxt}</p>
  <aside class="notes">Module {m['n']}. {esc(m['lede'])}</aside>
</section>"""


def closing(m):
    i = MODULES.index(m)
    nxt = next((x for x in MODULES[i + 1:] if x["status"] == "ready"), None)
    nl = f'<p>Next: <a href="{deck_name(nxt)}">Module {nxt["n"]}, {esc(nxt["title"])}</a></p>' if nxt else ""
    return f"""<section>
  <h2>Check yourself</h2>
  <p class="lede">Three short questions on the module page tell you whether this module has landed.</p>
  <p><a href="../modules/{page_name(m)}#check">Open the self-check for Module {m['n']}</a></p>
  <p class="small dim">Read more: Modern Epidemiology, 4th ed., {esc(m['rothman'])}.</p>
  {nl}
  <aside class="notes">Self-paced learners go to the module page from here. In a live session, skip this slide.</aside>
</section>"""


def sections_of(text):
    return re.findall(r"<section\b.*?</section>", text, re.S)


def build_decks():
    out = {}
    for m in READY:
        src = ROOT / "src" / "decks" / f"{m['id']}.html"
        if not src.exists():
            print(f"  WARNING: {m['id']} is marked ready but has no slide source yet")
            continue
        secs = sections_of(src.read_text())
        body = "\n\n".join([cover(m, "module")] + secs + [closing(m)])
        (ROOT / "slides" / deck_name(m)).write_text(DECK.format(title=f"Module {m['n']}: {esc(m['title'])}", sections=body))
        core = [s for s in secs if re.match(r"<section\b[^>]*\bdata-core\b", s)]
        out[m["id"]] = [cover(m, "workshop")] + (core or secs)
        print(f"  {deck_name(m)}: {len(secs) + 2} slides, {len(core)} on the workshop path")
    extra = {re.search(r'data-id="([^"]+)"', s).group(1): s for s in sections_of((ROOT / "src" / "decks" / "workshop.html").read_text())}
    body = []
    for w in WORKSHOP:
        if w.startswith("x:"):
            body.append(extra[w[2:]])
        elif w in out:
            body.extend(out[w])
    (ROOT / "slides" / "workshop.html").write_text(DECK.format(title="Causal inference in epidemiology: workshop path", sections="\n\n".join(body)))
    print(f"  workshop.html: {len(body)} slides")


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="{up}widgets/widget.css">
<script src="{up}widgets/theme.js"></script>
</head>
<body>
<header class="band"><div>
  <p class="kicker"><a href="{up}index.html">Causal inference for beginners</a> · {kicker}</p>
  <h1>{h1}</h1>
  <p>{lede}</p>
</div></header>
<main>
{body}
<footer>AIIMS Bhopal. Developed with Claude (Anthropic) as drafting and coding assistant; teaching judgements and every figure reviewed by the faculty.</footer>
</main>
{scripts}
</body>
</html>
"""


def module_page(m):
    i = MODULES.index(m)
    prev = MODULES[i - 1] if i else None
    nxt = MODULES[i + 1] if i + 1 < len(MODULES) else None
    learn = "".join(f"<li>{esc(x)}</li>" for x in m["learn"])
    ready = m["status"] == "ready"
    parts = [f'<section class="panel"><h2>By the end of this module you can</h2><ol class="steps">{learn}</ol></section>']
    if ready:
        lab = f'<a class="card" href="../{m["lab"][0]}"><span class="label">Lab</span><h2>{esc(m["lab"][1])}</h2><p>Guided, one step at a time, on your phone.</p><span class="go">Open the lab →</span></a>' if m["lab"] else ""
        parts.append(f'''<section class="cards" aria-label="Module materials">
  <a class="card" href="../slides/{deck_name(m)}"><span class="label">Slides</span><h2>{esc(m["title"])}</h2><p>Arrow keys or swipe to move. Each click adds one step, so take your time.</p><span class="go">Open the slides →</span></a>
  {lab}
</section>''')
        parts.append('<section class="panel" id="check"><h2>Check yourself</h2><p class="note">Pick an answer, then press Check. The explanation appears after you commit.</p><div id="checks"></div></section>')
    else:
        parts.append('<section class="panel"><p class="claim">This module is being written and will appear here after the November 2026 workshop. Until then, the reading below covers it.</p></section>')
    parts.append(f'<section class="panel"><h2>Read more</h2><p>Modern Epidemiology, 4th ed. (Lash, VanderWeele, Haneuse, Rothman, 2021): {esc(m["rothman"])}.</p></section>')
    nav = []
    if prev:
        nav.append(f'<a class="act ghost navbtn" href="{page_name(prev)}">← Module {prev["n"]}: {esc(prev["title"])}</a>')
    if nxt:
        nav.append(f'<a class="act navbtn" href="{page_name(nxt)}">Module {nxt["n"]}: {esc(nxt["title"])} →</a>')
    parts.append(f'<nav class="row modnav">{"".join(nav)}</nav>')
    scripts = ""
    if ready and m["checks"]:
        data = json.dumps(m["checks"], ensure_ascii=False).replace("</", "<\\/")
        scripts = f'<script type="application/json" id="checkdata">{data}</script>\n<script src="../widgets/check.js"></script>'
    return PAGE.format(title=f"Module {m['n']}: {esc(m['title'])}", up="../", kicker=f"Module {m['n']}",
                       h1=esc(m["title"]), lede=esc(m["lede"]), body="\n".join(parts), scripts=scripts)


def build_pages():
    (ROOT / "modules").mkdir(exist_ok=True)
    for m in MODULES:
        (ROOT / "modules" / page_name(m)).write_text(module_page(m))
    print(f"  modules/: {len(MODULES)} pages")


def build_index():
    rows = []
    for m in MODULES:
        tag = '' if m["status"] == "ready" else '<span class="pill">after the workshop</span>'
        rows.append(f'<a class="mod {"" if m["status"] == "ready" else "soon"}" href="modules/{page_name(m)}"><span class="mn">{m["n"]}</span>'
                    f'<span class="mt"><b>{esc(m["title"])}</b> {tag}<br><span class="dim">{esc(m["lede"])}</span></span></a>')
    body = f'''<section class="panel">
  <h2>Who this is for</h2>
  <p>Postgraduate students in Community Medicine who have met relative risks and 2 × 2 tables, and nothing more. Every idea is explained in plain words, worked with numbers, and practised on a published study. Go through it in order, at your own pace, or follow the workshop path.</p>
</section>
<section class="cards" aria-label="Start here">
  <a class="card" href="modules/{page_name(MODULES[0])}"><span class="label">Start</span><h2>Module 0</h2><p>{esc(MODULES[0]["title"])}. Ten minutes.</p><span class="go">Begin →</span></a>
  <a class="card" href="slides/workshop.html"><span class="label">Workshop path</span><h2>The core slides in one deck</h2><p>Used at the pre-conference workshop, Gwalior, 26 November 2026.</p><span class="go">Open →</span></a>
  <a class="card" href="widgets/quiz.html"><span class="label">Quiz</span><h2>Before and after</h2><p>Twelve questions. Take it before you start and again at the end.</p><span class="go">Open →</span></a>
  <a class="card" href="handouts.html"><span class="label">Print</span><h2>Handbooks and workbook</h2><p>The workshop handbook, the full course handbook, and the workbook as PDFs.</p><span class="go">Open →</span></a>
</section>
<section class="panel">
  <h2>The modules</h2>
  <div class="modlist">{"".join(rows)}</div>
</section>
<section class="panel">
  <h2>Labs</h2>
  <ul>
    <li><a href="widgets/potential-outcomes.html">Potential Outcomes Lab</a>: both futures of 100 men, then only one</li>
    <li><a href="widgets/dag-lab.html">Causal Diagram Lab</a>: tap to adjust, watch paths open and close</li>
    <li><a href="widgets/birthweight-lab.html">Birth Weight Paradox Lab</a></li>
    <li><a href="widgets/misclassification-lab.html">Misclassification Lab</a>: what recording errors do to a risk ratio</li>
    <li><a href="widgets/bias-lab.html">Unmeasured Confounding Lab</a>: bias factors and E-values</li>
    <li><a href="widgets/capstone-lab.html">Capstone Lab</a>: cooking fuel and ARI in NFHS-4</li>
  </ul>
  <p><a href="further-learning.html">Further learning</a>: Rothman chapter by chapter, free books and courses, key papers.</p>
</section>'''
    page = PAGE.format(title="Causal Inference in Epidemiology: A Course for Beginners", up="", kicker="AIIMS Bhopal",
                       h1="Causal Inference in Epidemiology", lede="A self-paced course for beginners: counterfactuals, causal diagrams, bias, and choosing what to adjust for. Anchored to Rothman's Modern Epidemiology, 4th edition.",
                       body=body, scripts="")
    page = page.replace('<a href="index.html">Causal inference for beginners</a> · AIIMS Bhopal', 'Self-paced course · AIIMS Bhopal')
    (ROOT / "index.html").write_text(page)
    print("  index.html")


def export_json():
    (ROOT / "src" / "course.json").write_text(json.dumps({"modules": MODULES, "workshop": WORKSHOP}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    export_json()
    build_decks()
    build_pages()
    build_index()
