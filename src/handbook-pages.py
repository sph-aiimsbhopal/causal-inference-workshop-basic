#!/usr/bin/env python3
"""Front and back matter for the participant handbook.

    python3 src/handbook-pages.py      # writes handbook/handbook-front.html and handbook-back.html

Same layout as the economic evaluation workshop kit. Every QR code is decoded
again before it is written, so a code that does not scan never reaches the printer.
"""
import base64, io, pathlib, sys
import qrcode, cv2, numpy as np

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent / "handbook"
OUT.mkdir(exist_ok=True)
SITE = "https://sph-aiimsbhopal.github.io/causal-inference-workshop-basic/"

LABS = [
    ("widgets/quiz.html", "Before and After Quiz", "Eight questions at the start, the same eight at the end. Your phone shows both scores."),
    ("widgets/potential-outcomes.html", "Lab 1 · Potential outcomes", "Both futures of 100 men, then only the one that happened. Smoking, alcohol and TB deaths."),
    ("widgets/dag-lab.html", "Lab 2 · Causal diagrams", "Tap a box to adjust for it and watch paths open and close. Six diagrams from real studies."),
    ("widgets/birthweight-lab.html", "Lab 3 · Birth weight paradox", "Why smoking seems to protect small babies, and why it does not."),
    ("widgets/capstone-lab.html", "Lab 4 · Cooking fuel and ARI", "Build your own diagram for an NFHS-4 analysis and test the authors' model."),
    ("further-learning.html", "Further learning", "Rothman chapter by chapter, free books and courses, and the key papers."),
]

GLOSSARY = [
    ("Potential outcome", "The outcome a person would have under one exposure level, written Y<sup>a=1</sup> or Y<sup>a=0</sup>. Everyone has one for each level; we see only the one that happened."),
    ("Counterfactual", "The potential outcome that did not happen. Contrary to fact, and never observed."),
    ("Causal effect", "For one person, the contrast between two potential outcomes. For a population, risk if everyone were exposed against risk if no one were."),
    ("Exchangeability", "Exposed and unexposed would have had the same risk had they swapped exposures. Randomisation gives it on average."),
    ("Positivity", "Every kind of person in the study could have been exposed or unexposed."),
    ("Consistency", "The exposure is well defined enough that 'if exposed' means one thing. Bidi and cigarette are different exposures."),
    ("Sufficient cause", "A complete set of component causes that together produce disease: one of Rothman's pies."),
    ("Component cause", "One slice of a pie. Removing it prevents every case that needed that pie."),
    ("Causal diagram (DAG)", "Directed acyclic graph. Arrows are direct causes, there are no loops, and every common cause is drawn, measured or not."),
    ("Path", "Any route between exposure and outcome, ignoring arrow direction. Causal if every arrow points from exposure towards outcome."),
    ("Back-door path", "A path that starts with an arrow into the exposure. An open one means confounding."),
    ("Fork", "A ← C → B. C is a common cause. The path is open; adjusting for C closes it."),
    ("Chain", "A → M → B. M is a mediator. Adjusting for M closes the path and removes part of the effect."),
    ("Collider", "A → K ← B. K is a common effect. The path is closed; adjusting for K, or selecting on it, opens it."),
    ("Confounder", "A variable that can block an open back-door path. Defined by the diagram, not by a p-value or a 10% change."),
    ("Selection bias", "Bias from conditioning on a collider, often by how people entered or stayed in the study."),
    ("Differential misclassification", "Measurement error in the exposure that depends on the outcome, or the other way round. Can bias in either direction."),
    ("Back-door criterion", "Adjust for a set that blocks every back-door path and contains nothing caused by the exposure."),
    ("Minimal adjustment set", "A set that meets the back-door criterion and loses its power if any variable is dropped."),
    ("Table 2 fallacy", "Reading every coefficient in a multivariable model as a causal effect. One model answers one causal question."),
    ("Target trial", "The randomised trial you would run if you could. The observational study is designed to imitate it."),
    ("Time zero", "When eligibility is met, treatment starts and follow-up begins, all at once, as in a trial."),
    ("Negative control", "An exposure or outcome that should show no effect. If it does, suspect bias."),
]

AGENDA = [
    ("10", "", "Opening: two studies, opposite answers", "Hormone therapy and heart disease: the cohort said protective, the trial said harmful."),
    ("5", "", "Before quiz", "On your phone, or on workbook page 1."),
    ("25", "1", "Thinking causally", "Potential outcomes, exchangeability, positivity, consistency, sufficient causes."),
    ("20", "", "Exercise 1 and debrief", "Smoking and TB deaths in Tamil Nadu. Workbook page 2, Lab 1."),
    ("25", "2", "Causal diagrams and the structure of bias", "Forks, chains, colliders. Confounding, selection bias, measurement error."),
    ("32", "", "Exercises 2 and 3, debrief", "Hormone therapy; the birth weight paradox. Workbook pages 3 and 4, Labs 2 and 3."),
    ("15", "", "Tea", ""),
    ("15", "3", "From diagram to adjustment", "The back-door rule, what not to adjust for, the Table 2 fallacy."),
    ("28", "", "Group exercise and report-back", "Cooking fuel and childhood ARI, NFHS-4. Workbook page 5, Lab 4."),
    ("8", "", "Close and after quiz", "Your own causal question; back to the hormones; where to go next."),
]

READING = [
    ("Modern Epidemiology, 4th ed. (Lash, VanderWeele, Haneuse, Rothman, 2021)", "Chapters 2 and 3 for causation and causal models; 12 confounding; 13 measurement; 14 selection bias. Then 18 stratification, 25 time-varying exposures, 27 mediation, 28 instrumental variables, 29 bias analysis."),
    ("Hernán MA, Robins JM. Causal Inference: What If. 2020.", "Free from the authors' website. Part I needs nothing beyond proportions."),
    ("HarvardX: Causal Diagrams: Draw Your Assumptions Before Your Conclusions", "Free online course by Miguel Hernán. The natural next step after today."),
    ("DAGitty, dagitty.net", "Draw diagrams in the browser and get adjustment sets. Also an R package."),
    ("Pearl J, Mackenzie D. The Book of Why. 2018.", "A readable history of causal thinking."),
    ("Greenland S, Pearl J, Robins JM. Epidemiology 1999;10:37-48.", "Causal diagrams for epidemiologic research."),
    ("Hernán MA, Hernández-Díaz S, Robins JM. Epidemiology 2004;15:615-25.", "A structural approach to selection bias."),
    ("Westreich D, Greenland S. Am J Epidemiol 2013;177:292-8.", "The Table 2 fallacy."),
    ("VanderWeele TJ. Eur J Epidemiol 2019;34:211-9.", "Principles of confounder selection."),
    ("Tennant PWG, et al. Int J Epidemiol 2021;50:620-32.", "Use of DAGs to identify confounders in applied health research: review and recommendations."),
    ("Hernán MA, Robins JM. Am J Epidemiol 2016;183:758-64.", "Emulating a target trial when a randomised trial is not available."),
    ("Hernán MA. Am J Public Health 2018;108:616-9.", "The C-word: why to call a causal question causal."),
]

SOURCES = [
    "Grodstein F, Stampfer MJ, Manson JE, et al. Postmenopausal estrogen and progestin use and the risk of cardiovascular disease. N Engl J Med 1996;335:453-61.",
    "Writing Group for the Women's Health Initiative Investigators. Risks and benefits of estrogen plus progestin in healthy postmenopausal women. JAMA 2002;288:321-33.",
    "Hernán MA, Alonso A, Logan R, et al. Observational studies analyzed like randomized experiments: an application to postmenopausal hormone therapy and coronary heart disease. Epidemiology 2008;19:766-79.",
    "Gajalakshmi V, Peto R, Kanaka TS, Jha P. Smoking and mortality from tuberculosis and other diseases in India: retrospective study of 43000 adult male deaths and 35000 controls. Lancet 2003;362:507-15.",
    "Hernández-Díaz S, Schisterman EF, Hernán MA. The birth weight “paradox” uncovered? Am J Epidemiol 2006;164:1115-20.",
    "Mondal D, Paul P. Effects of indoor pollution on acute respiratory infections among under-five children in India: evidence from a nationally representative population-based study. PLoS ONE 2020;15(8):e0237611.",
]


def qr_datauri(url):
    q = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=2)
    q.add_data(url); q.make(fit=True)
    img = q.make_image(fill_color="black", back_color="white").convert("RGB")
    buf = io.BytesIO(); img.save(buf, format="PNG"); raw = buf.getvalue()
    arr = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE)
    decoded, _, _ = cv2.QRCodeDetector().detectAndDecode(arr)
    if decoded != url:
        sys.exit(f"QR check failed for {url!r}: decoded {decoded!r}")
    print(f"  QR ok: {url}")
    return "data:image/png;base64," + base64.b64encode(raw).decode()


def logo(name):
    return "data:image/png;base64," + base64.b64encode((HERE / name).read_bytes()).decode()


CSS = """
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box }
body { margin:0; font: 10.5pt/1.45 Arial, Helvetica, sans-serif; color:#10141A; -webkit-print-color-adjust:exact; print-color-adjust:exact }
.page { width:210mm; height:297mm; padding:20mm 18mm 16mm; page-break-after:always; position:relative; display:flex; flex-direction:column }
.page:last-child { page-break-after:auto }
h1 { font-size:28pt; line-height:1.1; color:#162a6c; margin:0 0 .35em; font-weight:700 }
h2 { font-size:17pt; color:#162a6c; margin:0 0 .5em; font-weight:700 }
h3 { font-size:11pt; color:#162a6c; margin:0 0 .15em; font-weight:700 }
p { margin:0 0 .7em }
.lede { font-size:12.5pt; line-height:1.5 }
.dim { color:#5A6273 } .faint { color:#9AA1B0 }
.rule { height:2.2pt; background:#162a6c; margin:0 0 6mm }
.foot { margin-top:auto; font-size:7.5pt; color:#9AA1B0; display:flex; justify-content:space-between; border-top:.3pt solid #E3E6EE; padding-top:2mm }
.cover { padding:0 }
.cband { background:#162a6c; color:#fff; padding:16mm 18mm 12mm }
.cband .kick { font-size:8.5pt; letter-spacing:.14em; text-transform:uppercase; color:#AEBBE0; margin:0 0 6mm }
.cband h1 { color:#fff; font-size:34pt; margin:0 0 3mm }
.cband .sub { font-size:13pt; color:#D6DEF2; margin:0 }
.cbody { padding:12mm 18mm 16mm; display:flex; flex-direction:column; flex:1 1 auto }
.kitword { font-size:15pt; font-weight:700; color:#162a6c; letter-spacing:.02em; margin:0 0 8mm }
.meta { font-size:11pt; line-height:1.7; margin:0 0 10mm }
.meta b { color:#162a6c }
.nameplate { border:1.2pt solid #162a6c; padding:7mm 8mm; margin-top:auto }
.nameplate .nt { font-size:8.5pt; letter-spacing:.12em; text-transform:uppercase; color:#162a6c; margin:0 0 5mm }
.nameplate .row { display:flex; gap:8mm; margin-bottom:6mm }
.nameplate .f { flex:1 1 auto }
.nameplate .f span { font-size:8.5pt; color:#7A8394; display:block; margin-bottom:1mm }
.nameplate .f i { display:block; border-bottom:.6pt solid #9AA1B0; height:7mm }
.logos { display:flex; gap:8mm; align-items:center; margin-bottom:8mm }
.logos img { height:17mm }
table { width:100%; border-collapse:collapse; font-size:10pt }
td, th { padding:2.4mm 3mm; border-bottom:.3pt solid #D8DCE6; vertical-align:top; text-align:left }
th { background:#162a6c; color:#fff; font-size:9pt; letter-spacing:.04em }
td.n { width:8mm; font-weight:700; color:#162a6c; text-align:center }
td.t { width:16mm; white-space:nowrap; color:#5A6273; font-variant-numeric:tabular-nums; text-align:right }
tr.brk td { color:#9AA1B0; font-style:italic; background:#F5F7FB }
.qgrid { display:grid; grid-template-columns:1fr 1fr; gap:7mm 8mm; margin-top:3mm }
.qcell { border:.5pt solid #D8DCE6; padding:5mm; display:flex; gap:5mm; align-items:flex-start }
.qcell img { width:30mm; height:30mm; flex:0 0 30mm }
.qcell p { font-size:9pt; line-height:1.4; margin:0; color:#5A6273 }
.gl { column-count:2; column-gap:9mm; font-size:9pt; line-height:1.36 }
.gl div { break-inside:avoid; margin-bottom:2.4mm }
.gl b { color:#162a6c }
.rd div { margin-bottom:3.2mm; font-size:9.5pt; line-height:1.4; break-inside:avoid }
.rd b { color:#162a6c }
.fb .q { margin-bottom:6mm }
.fb .q p { margin:0 0 2mm; font-size:10.5pt }
.fb .scale { display:flex; gap:4mm; font-size:9pt; color:#5A6273 }
.fb .scale span { border:.5pt solid #9AA1B0; padding:1.6mm 0; flex:1 1 0; text-align:center }
.fb .lines { background:repeating-linear-gradient(to bottom, transparent 0 7mm, #D8DCE6 7mm 7.15mm); }
.notesheet { flex:1 1 auto; background:repeating-linear-gradient(to bottom, transparent 0 7mm, #D8DCE6 7mm 7.15mm) }
.lic { font-size:9pt; line-height:1.4 }
.lic div { margin-bottom:3mm; padding-left:5mm; text-indent:-5mm }
.back { justify-content:center; align-items:center; text-align:center }
.back img { width:46mm; height:46mm; margin-bottom:6mm }
.back .u { font-size:11pt; font-weight:700; color:#162a6c; word-break:break-all }
"""

FOOT = ('<div class="foot"><span>Causal Inference in Epidemiology &middot; 12th SCZ IAPSMCon pre-conference workshop '
        '&middot; Gwalior, 26 November 2026</span><span>{}</span></div>')


def front():
    qcells = "".join(f'<div class="qcell"><img src="{qr_datauri(SITE + path)}"><div><h3>{name}</h3><p>{desc}</p></div></div>'
                     for path, name, desc in LABS)
    rows = "".join(
        f'<tr class="brk"><td class="t">{m} min</td><td class="n"></td><td colspan="2"><em>{s}</em></td></tr>' if not d else
        f'<tr><td class="t">{m} min</td><td class="n">{n}</td><td><strong>{s}</strong></td><td class="dim">{d}</td></tr>'
        for m, n, s, d in AGENDA)
    gl = "".join(f"<div><b>{t}.</b> {d}</div>" for t, d in GLOSSARY)
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>Handbook front</title><style>{CSS}</style></head><body>

<div class="page cover">
  <div class="cband">
    <p class="kick">12th South Central Zone IAPSM Conference &nbsp;&middot;&nbsp; Pre-conference workshop</p>
    <h1>Causal Inference<br>in Epidemiology</h1>
    <p class="sub">A three-hour workshop on counterfactuals, causal diagrams, bias, and choosing what to adjust for</p>
  </div>
  <div class="cbody">
    <div class="logos"><img src="{logo('aiims.png')}"></div>
    <p class="kitword">Participant handbook</p>
    <p class="meta">
      <b>Thursday 26 November 2026</b><br>
      Department of Community Medicine, Gajra Raja Medical College, Gwalior<br>
      Resource faculty: Dr Abhijit Pakhare and Dr Ankur Joshi, AIIMS Bhopal<br>
      <span class="dim">For MD students in Community Medicine</span>
    </p>
    <div class="nameplate">
      <p class="nt">This handbook belongs to</p>
      <div class="row"><div class="f"><span>Name</span><i></i></div><div class="f"><span>Institute</span><i></i></div></div>
      <div class="row" style="margin-bottom:0"><div class="f"><span>Group</span><i></i></div><div class="f" style="flex:2 1 auto"><span>Your thesis topic</span><i></i></div></div>
    </div>
  </div>
</div>

<div class="page">
  <h1>What these three hours are for</h1>
  <div class="rule"></div>
  <p class="lede">By the end you should be able to pick up an observational study, draw the causal assumptions behind it,
  and say whether its adjustment could estimate the effect it claims. Not whether the regression ran, but whether the
  comparison it makes is the one the question needs.</p>
  <p><strong>You will be able to:</strong></p>
  <ol>
    <li>Explain causal effects using the counterfactual framework, and draw causal diagrams (DAGs).</li>
    <li>Identify and assess bias and confounding in observational studies using causal diagrams.</li>
    <li>Choose an adjustment set from a diagram, and frame and interpret causal research questions in Community Medicine.</li>
  </ol>
  <h2 style="margin-top:7mm">How the workshop runs</h2>
  <p>Each block starts with the concepts on slides, then an exercise on a published study: on paper first, in this
  handbook, then on your phone in one of the labs. The studies are hormone therapy and heart disease, smoking and TB
  deaths in Tamil Nadu, the birth weight paradox, and cooking fuel and childhood ARI in NFHS-4.</p>
  <p>In the last block your group gets one exposure from the NFHS-4 study, draws its diagram, and tests the
  authors' model against it. Each group reports back in one minute.</p>
  <h2 style="margin-top:7mm">One house rule</h2>
  <p class="lede">A diagram is a set of claims, and you are allowed to disagree with anyone's, including ours. By the end you
  should be able to say exactly which arrow you disagree with, and what that changes.</p>
  <p class="dim" style="margin-top:6mm">Rothman's <em>Modern Epidemiology</em> (4th edition) is the anchor text. Each session
  divider in this handbook says which chapters to read next.</p>
  {FOOT.format('What these three hours are for')}
</div>

<div class="page">
  <h1>The three hours</h1>
  <div class="rule"></div>
  <table>
    <tr><th style="text-align:right">Time</th><th>&nbsp;</th><th>Session</th><th>What it covers</th></tr>
    {rows}
  </table>
  <p class="dim" style="margin-top:5mm; font-size:9.5pt">Timings are the plan, not a promise. Slides and workbook pages are
  numbered, so a block that runs long does not put anything in this handbook out of step.</p>
  <h2 style="margin-top:6mm">What is in this handbook</h2>
  <table>
    <tr><td><strong>The slides</strong></td><td class="dim">Two to a page with room for notes, each session behind a divider that says what it adds and what to read next.</td></tr>
    <tr><td><strong>The workbook</strong></td><td class="dim">Six pages: the before quiz on paper, the three exercises, the group exercise, and a page to frame your own causal question.</td></tr>
    <tr><td><strong>At the back</strong></td><td class="dim">Further reading, a feedback page to hand in, notes pages, and the sources.</td></tr>
  </table>
  {FOOT.format('The three hours')}
</div>

<div class="page">
  <h1>On your phone</h1>
  <div class="rule"></div>
  <p>The quiz and the four labs run in your phone's browser; nothing to install and nothing sent anywhere. Point your
  camera at a code. They stay online after the workshop, so you can use the diagram labs on your own thesis question.</p>
  <div class="qgrid">{qcells}</div>
  {FOOT.format('Interactive pages')}
</div>

<div class="page">
  <h1>Words you will hear today</h1>
  <div class="rule"></div>
  <div class="gl">{gl}</div>
  {FOOT.format('Glossary')}
</div>

</body></html>"""


def back(notes_pages):
    rd = "".join(f"<div><b>{t}</b> {d}</div>" for t, d in READING)
    fb = "".join(
        f'<div class="q"><p>{q}</p><div class="scale"><span>Not at all</span><span>A little</span><span>Fairly</span><span>Very</span><span>Completely</span></div></div>'
        for q in [
            "I can explain what a causal effect is, using potential outcomes.",
            "I can draw a causal diagram for a study in my own field.",
            "I can tell a confounder from a mediator and a collider, and say why it matters for adjustment.",
            "I could check whether a published paper's adjustment set suits its causal question.",
            "The studies used in the exercises were the right level of difficulty.",
        ])
    notes = "".join(f'<div class="page"><h2>Notes</h2><div class="rule"></div><div class="notesheet"></div>{FOOT.format("Notes")}</div>'
                    for _ in range(notes_pages))
    src = "".join(f"<div>{s}</div>" for s in SOURCES)
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>Handbook back</title><style>{CSS}</style></head><body>

<div class="page">
  <h1>Where to go next</h1>
  <div class="rule"></div>
  <p class="dim">In the order we suggest. The full list, with links, is on the Further Learning page of the workshop site.</p>
  <div class="rd">{rd}</div>
  {FOOT.format('Further learning')}
</div>

<div class="page fb">
  <h1>Feedback</h1>
  <div class="rule"></div>
  <p class="dim">Please tear this page out and leave it with us before you go. It decides what the next one of these looks like.</p>
  {fb}
  <div class="q" style="flex:1 1 auto; display:flex; flex-direction:column">
    <p><strong>One thing that should be cut, and one thing that needed more time.</strong></p>
    <div class="lines" style="flex:1 1 auto; min-height:34mm"></div>
  </div>
  <div class="q" style="margin-bottom:0">
    <p><strong>Which study in your own department would you now like to draw a diagram for?</strong></p>
    <div class="lines" style="height:22mm"></div>
  </div>
  {FOOT.format('Feedback')}
</div>

{notes}

<div class="page">
  <h1>Sources</h1>
  <div class="rule"></div>
  <p>The studies used in the exercises. Figures quoted in the slides and workbook were checked against these papers.
  The teaching populations in Labs 1 and 3, and the names on the potential-outcomes slide, are illustrative and
  labelled as such.</p>
  <div class="lic">{src}</div>
  <p style="margin-top:6mm; font-size:9pt" class="dim">Anchor text: Lash TL, VanderWeele TJ, Haneuse S, Rothman KJ.
  Modern Epidemiology. 4th ed. Philadelphia: Wolters Kluwer; 2021.</p>
  <p style="margin-top:4mm; font-size:9pt" class="dim">The teaching material in this handbook, the slides, workbook,
  labs and glossary, was developed at AIIMS Bhopal with Claude (Anthropic) as drafting and coding assistant. The
  teaching judgements are the faculty's, and every citation and figure was verified against the primary source.</p>
  {FOOT.format('Sources')}
</div>

<div class="page back">
  <img src="{qr_datauri(SITE)}">
  <p class="u">sph-aiimsbhopal.github.io/<br>causal-inference-workshop-basic</p>
  <p class="dim" style="max-width:120mm; margin-top:6mm">The slides, labs, workbook and reading list from today live here,
  and stay here. Free to reuse with your own students.</p>
  <p class="faint" style="margin-top:10mm; font-size:9pt">AIIMS Bhopal &middot; 12th South Central Zone IAPSM Conference, Gwalior</p>
</div>

</body></html>"""


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    (OUT / "handbook-front.html").write_text(front())
    (OUT / "handbook-back.html").write_text(back(n))
    print(f"wrote handbook-front.html and handbook-back.html ({n} notes pages)")
