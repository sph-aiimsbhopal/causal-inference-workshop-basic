// Causal diagrams used in the labs. Each is built from a published study.
// Coordinates are for a 420-wide viewBox so the diagrams stay legible on a phone.
window.DAGS = {
  fork: {
    task: 'Smoking has no effect on TB death in this diagram, yet the two are associated. Tap one box to make the association disappear, then press Check.',
    title: 'Fork', x: 'smk', y: 'tb', height: 270,
    story: '<p>Alcohol use makes a man more likely to smoke. Alcohol use also raises his risk of dying of TB. Does that create an association between smoking and TB death, even with no arrow from smoking to TB?</p>',
    src: 'Variables from Gajalakshmi et al., Lancet 2003. Arrow from smoking to TB left out on purpose.',
    nodes: [
      { id: 'alc', label: 'Alcohol use', x: 210, y: 50 },
      { id: 'smk', label: 'Smoking', x: 75, y: 220 },
      { id: 'tb', label: 'TB death', x: 345, y: 220 }
    ],
    edges: [['alc', 'smk'], ['alc', 'tb']]
  },
  chain: {
    task: 'You want the total effect of smoking on infant death. Decide whether to adjust for anything, then press Check. Try tapping low birth weight too.',
    title: 'Chain', x: 'smk', y: 'die', height: 260,
    story: '<p>Smoking in pregnancy lowers birth weight. Low birth weight raises infant mortality. What happens to the smoking and infant death association if you adjust for birth weight?</p>',
    src: 'Variables from Hernández-Díaz et al., Am J Epidemiol 2006.',
    nodes: [
      { id: 'smk', label: 'Maternal\nsmoking', x: 75, y: 45 },
      { id: 'lbw', label: 'Low birth\nweight', x: 210, y: 130 },
      { id: 'die', label: 'Infant\ndeath', x: 345, y: 215 }
    ],
    edges: [['smk', 'lbw'], ['lbw', 'die']]
  },
  collider: {
    task: 'Smoking and birth defects are unrelated. Press Check with nothing adjusted. Then tap low birth weight and check again.',
    title: 'Collider', x: 'smk', y: 'def', height: 270,
    story: '<p>Maternal smoking and birth defects are two separate causes of low birth weight. Suppose they are not associated in the population. What happens if you look only at low birth weight babies?</p>',
    src: 'Variables from Hernández-Díaz et al., Am J Epidemiol 2006.',
    nodes: [
      { id: 'smk', label: 'Maternal\nsmoking', x: 75, y: 60 },
      { id: 'def', label: 'Birth\ndefect', x: 345, y: 60 },
      { id: 'lbw', label: 'Low birth\nweight', x: 210, y: 215 }
    ],
    edges: [['smk', 'lbw'], ['def', 'lbw']]
  },
  hrt: {
    task: 'Adjust for everything the cohort measured before women started hormones. Is that enough? Then try adding lipids and blood pressure.',
    title: 'HRT and heart disease', x: 'hrt', y: 'chd', height: 425,
    story: '<p>The Nurses\' Health Study followed 59,337 women. Women taking oestrogen plus progestin had less than half the risk of major coronary heart disease (adjusted RR 0.39). Six years later the Women\'s Health Initiative trial randomised 16,608 women and found more heart disease with the same hormones (HR 1.29).</p><p>Which arrows could produce a protective-looking association in the cohort?</p>',
    src: 'Grodstein et al., N Engl J Med 1996; Writing Group for the WHI Investigators, JAMA 2002.',
    nodes: [
      { id: 'ses', label: 'Education,\nincome', x: 230, y: 45 },
      { id: 'age', label: 'Age', x: 60, y: 240 },
      { id: 'life', label: 'Smoking,\ndiet, BMI', x: 355, y: 130 },
      { id: 'seek', label: 'Health-seeking\n(not measured)', x: 250, y: 205, observed: false },
      { id: 'hrt', label: 'HRT', x: 70, y: 320 },
      { id: 'chd', label: 'CHD', x: 350, y: 320 },
      { id: 'lip', label: 'Lipids, BP\nafter starting', x: 210, y: 390 }
    ],
    edges: [['ses', 'hrt'], ['ses', 'life'], ['ses', 'seek'], ['age', 'hrt'], ['age', 'chd'], ['life', 'chd'],
      ['seek', 'hrt'], ['seek', 'chd'], ['seek', 'life'], ['hrt', 'lip'], ['lip', 'chd'], ['hrt', 'chd']]
  },
  tb: {
    task: 'Adjust for what the study adjusted for: age and education. Press Check. Which path stays open, and why can it not be closed?',
    title: 'Smoking and TB deaths', x: 'smk', y: 'tb', height: 430,
    story: '<p>Gajalakshmi and colleagues compared 43,000 men who died in Tamil Nadu with 35,000 living men. Ever smokers had 4.5 times the TB death rate of never smokers (urban, ages 25 to 69). The ratio was standardised for age, education and tobacco chewing. It was not adjusted for alcohol.</p><p>Which paths from smoking to TB death are still open?</p>',
    src: 'Gajalakshmi V, Peto R, Kanaka TS, Jha P. Lancet 2003;362:507-15.',
    nodes: [
      { id: 'peer', label: 'Peer group,\npersonality', x: 210, y: 40, observed: false },
      { id: 'edu', label: 'Education', x: 65, y: 120 },
      { id: 'alc', label: 'Alcohol use\n(not adjusted)', x: 335, y: 135, observed: false },
      { id: 'nut', label: 'Under-\nnutrition', x: 230, y: 240 },
      { id: 'smk', label: 'Smoking', x: 65, y: 320 },
      { id: 'tb', label: 'TB death', x: 350, y: 320 },
      { id: 'age', label: 'Age', x: 210, y: 400 }
    ],
    edges: [['peer', 'smk'], ['peer', 'alc'], ['edu', 'smk'], ['edu', 'alc'], ['edu', 'nut'], ['alc', 'nut'], ['alc', 'tb'],
      ['nut', 'tb'], ['age', 'smk'], ['age', 'tb'], ['smk', 'tb']]
  },
  bw: {
    task: 'Tap low birth weight to restrict to small babies, then press Check. Open the paths: which one is red?',
    title: 'Birth weight paradox', x: 'smk', y: 'die', height: 370,
    story: '<p>US births, 1991. Infants of smokers had higher mortality: 1,235 against 805 per 100,000 live births (rate ratio 1.55). Among low birth weight babies only, infants of smokers had <b>lower</b> mortality (rate ratio 0.79).</p><p>Is smoking good for small babies? Tap low birth weight to restrict to it.</p>',
    src: 'Hernández-Díaz S, Schisterman EF, Hernán MA. Am J Epidemiol 2006;164:1115-20.',
    nodes: [
      { id: 'smk', label: 'Maternal\nsmoking', x: 70, y: 70 },
      { id: 'die', label: 'Infant\ndeath', x: 350, y: 70 },
      { id: 'lbw', label: 'Low birth\nweight', x: 200, y: 190 },
      { id: 'def', label: 'Birth defects,\nother causes\n(not measured)', x: 330, y: 300, observed: false }
    ],
    edges: [['smk', 'lbw'], ['lbw', 'die'], ['def', 'lbw'], ['def', 'die'], ['smk', 'die']]
  }
};

// Capstone: Mondal D, Paul P. PLoS ONE 2020;15(8):e0237611 (NFHS-4, 247,743 children under five).
window.CAPSTONE = {
  height: 640,
  nodes: [
    { id: 'state', label: 'State,\nregion', x: 120, y: 175 },
    { id: 'res', label: 'Rural or\nurban', x: 350, y: 245 },
    { id: 'caste', label: 'Caste,\nreligion', x: 265, y: 170 },
    { id: 'wealth', label: 'Wealth', x: 200, y: 235 },
    { id: 'edu', label: "Mother's\neducation", x: 245, y: 340 },
    { id: 'matage', label: "Mother's\nage", x: 55, y: 105 },
    { id: 'kitchen', label: 'Separate\nkitchen', x: 365, y: 360 },
    { id: 'smoke', label: 'Household\nsmoking', x: 65, y: 470 },
    { id: 'crowd', label: 'Crowding', x: 355, y: 455 },
    { id: 'fuel', label: 'Biomass\nfuel', x: 100, y: 295 },
    { id: 'tbhh', label: 'TB in\nhousehold', x: 360, y: 525 },
    { id: 'nut', label: 'Child\nundernutrition', x: 145, y: 585 },
    { id: 'ari', label: 'ARI, last\n2 weeks', x: 240, y: 515 },
    { id: 'border', label: 'Birth\norder', x: 50, y: 375 },
    { id: 'child', label: 'Child age,\nsex', x: 290, y: 605 }
  ],
  // Arrows a participant can switch on or off. 'ours' marks the facilitators' diagram.
  candidates: [
    { e: ['wealth', 'fuel'], ours: 1, g: 'fuel' }, { e: ['edu', 'fuel'], ours: 1, g: 'fuel' }, { e: ['res', 'fuel'], ours: 1, g: 'fuel' },
    { e: ['state', 'fuel'], ours: 1, g: 'fuel' }, { e: ['caste', 'fuel'], ours: 0, g: 'fuel' }, { e: ['kitchen', 'fuel'], ours: 0, g: 'fuel' },
    { e: ['fuel', 'ari'], ours: 1, g: 'ari' }, { e: ['kitchen', 'ari'], ours: 1, g: 'ari' }, { e: ['smoke', 'ari'], ours: 1, g: 'ari' },
    { e: ['crowd', 'ari'], ours: 1, g: 'ari' }, { e: ['tbhh', 'ari'], ours: 1, g: 'ari' }, { e: ['nut', 'ari'], ours: 1, g: 'ari' },
    { e: ['child', 'ari'], ours: 1, g: 'ari' }, { e: ['border', 'ari'], ours: 1, g: 'ari' }, { e: ['res', 'ari'], ours: 1, g: 'ari' },
    { e: ['state', 'ari'], ours: 1, g: 'ari' }, { e: ['edu', 'ari'], ours: 1, g: 'ari' }, { e: ['wealth', 'ari'], ours: 0, g: 'ari' },
    { e: ['fuel', 'nut'], ours: 1, g: 'other' }, { e: ['wealth', 'nut'], ours: 1, g: 'other' }, { e: ['edu', 'nut'], ours: 1, g: 'other' },
    { e: ['wealth', 'kitchen'], ours: 1, g: 'other' }, { e: ['res', 'kitchen'], ours: 1, g: 'other' }, { e: ['fuel', 'kitchen'], ours: 0, g: 'other' },
    { e: ['wealth', 'smoke'], ours: 1, g: 'other' }, { e: ['edu', 'smoke'], ours: 1, g: 'other' },
    { e: ['wealth', 'crowd'], ours: 1, g: 'other' }, { e: ['border', 'crowd'], ours: 1, g: 'other' }, { e: ['crowd', 'tbhh'], ours: 1, g: 'other' },
    { e: ['caste', 'wealth'], ours: 1, g: 'other' }, { e: ['caste', 'edu'], ours: 1, g: 'other' }, { e: ['res', 'wealth'], ours: 1, g: 'other' },
    { e: ['res', 'edu'], ours: 1, g: 'other' }, { e: ['state', 'res'], ours: 1, g: 'other' }, { e: ['state', 'wealth'], ours: 1, g: 'other' },
    { e: ['edu', 'wealth'], ours: 0, g: 'other' }, { e: ['matage', 'border'], ours: 1, g: 'other' }, { e: ['edu', 'border'], ours: 1, g: 'other' },
    { e: ['edu', 'matage'], ours: 0, g: 'other' }
  ],
  // Covariates in the paper's final model (Model 4), excluding the exposure.
  paperSet: { fuel: ['child', 'border', 'matage', 'edu', 'caste', 'wealth', 'tbhh', 'crowd', 'kitchen', 'smoke'],
    kitchen: ['child', 'border', 'matage', 'edu', 'caste', 'wealth', 'tbhh', 'crowd', 'fuel', 'smoke'],
    edu: ['child', 'border', 'matage', 'caste', 'wealth', 'tbhh', 'crowd', 'fuel', 'kitchen', 'smoke'] },
  paperOR: { fuel: '1.10 (1.01 to 1.20)', kitchen: '1.22 (1.14 to 1.30) for no separate kitchen', edu: '1.32, 1.19 and 1.21 for primary, secondary and higher, against none' }
};

// Extra diagrams used only on the slides.
Object.assign(window.DAGS, {
  berkson: {
    title: 'Hospital controls', x: 'smk', y: 'tb', height: 250,
    nodes: [
      { id: 'smk', label: 'Smoking', x: 75, y: 60 },
      { id: 'tb', label: 'TB', x: 345, y: 60 },
      { id: 'adm', label: 'Admitted to\nhospital', x: 210, y: 200 }
    ],
    edges: [['smk', 'adm'], ['tb', 'adm']]
  },
  measure: {
    title: 'Proxy reporting', x: 'smk', y: 'tb', height: 250,
    nodes: [
      { id: 'smk', label: 'Smoking\n(true)', x: 75, y: 60 },
      { id: 'tb', label: 'TB death', x: 345, y: 60 },
      { id: 'rep', label: 'Smoking as\nreported by family', x: 150, y: 200 },
      { id: 'err', label: 'Reporting\nerror', x: 340, y: 200, observed: false }
    ],
    edges: [['smk', 'rep'], ['smk', 'tb'], ['err', 'rep'], ['tb', 'err']]
  },
  confound: {
    title: 'Confounding', x: 'smk', y: 'tb', height: 250,
    nodes: [
      { id: 'alc', label: 'Alcohol use', x: 210, y: 50 },
      { id: 'smk', label: 'Smoking', x: 75, y: 200 },
      { id: 'tb', label: 'TB death', x: 345, y: 200 }
    ],
    edges: [['alc', 'smk'], ['alc', 'tb'], ['smk', 'tb']]
  }
});

// Diagrams for the module decks.
Object.assign(window.DAGS, {
  smktb: {
    title: 'Smoking and TB death', x: 'smk', y: 'tb', height: 200,
    nodes: [ { id: 'smk', label: 'Smoking', x: 80, y: 100 }, { id: 'tb', label: 'TB death', x: 340, y: 100 } ],
    edges: [['smk', 'tb']]
  },
  practice1: {
    task: 'Find the adjustment set for the total effect of chewing on oral cancer. Then try adding the screening camp.',
    title: 'Practice 1: tobacco and oral cancer', x: 'tob', y: 'ca', height: 360,
    story: '<p>Tobacco chewing and oral cancer. Older men chew more and get more cancer. Chewing causes white patches (leukoplakia), which can turn into cancer. Both chewing and early symptoms make a man more likely to attend a screening camp.</p>',
    src: 'Practice diagram for Module 10.',
    nodes: [
      { id: 'age', label: 'Age', x: 210, y: 45 },
      { id: 'tob', label: 'Tobacco\nchewing', x: 70, y: 170 },
      { id: 'ca', label: 'Oral\ncancer', x: 350, y: 170 },
      { id: 'leu', label: 'Leukoplakia', x: 210, y: 210 },
      { id: 'camp', label: 'Attended\nscreening camp', x: 210, y: 320 }
    ],
    edges: [['age', 'tob'], ['age', 'ca'], ['tob', 'leu'], ['leu', 'ca'], ['tob', 'camp'], ['ca', 'camp']]
  },
  practice2: {
    task: 'Find an adjustment set for the total effect of diabetes on TB. Is there more than one?',
    title: 'Practice 2: diabetes and TB', x: 'dm', y: 'tb', height: 350,
    story: '<p>Diabetes and active TB. Age raises both. Poverty makes diabetes less likely to be diagnosed but undernutrition more likely, and undernutrition raises TB risk. HbA1c is measured after diabetes is diagnosed.</p>',
    src: 'Practice diagram for Module 10.',
    nodes: [
      { id: 'age', label: 'Age', x: 210, y: 140 },
      { id: 'pov', label: 'Poverty', x: 70, y: 50 },
      { id: 'nut', label: 'Under-\nnutrition', x: 350, y: 110 },
      { id: 'dm', label: 'Diabetes', x: 70, y: 235 },
      { id: 'tb', label: 'Active TB', x: 350, y: 235 },
      { id: 'hba', label: 'HbA1c\nafter diagnosis', x: 160, y: 315 }
    ],
    edges: [['age', 'dm'], ['age', 'tb'], ['pov', 'dm'], ['pov', 'nut'], ['nut', 'tb'], ['dm', 'tb'], ['dm', 'hba']]
  },
  fuel8: {
    title: 'Cooking fuel and ARI: first eight', x: 'fuel', y: 'ari', height: 440,
    nodes: [
      { id: 'state', label: 'State', x: 60, y: 140 },
      { id: 'res', label: 'Rural or\nurban', x: 210, y: 45 },
      { id: 'wealth', label: 'Wealth', x: 350, y: 45 },
      { id: 'edu', label: "Mother's\neducation", x: 362, y: 170 },
      { id: 'fuel', label: 'Biomass\nfuel', x: 70, y: 290 },
      { id: 'kitchen', label: 'Separate\nkitchen', x: 180, y: 350 },
      { id: 'ari', label: 'ARI', x: 350, y: 290 },
      { id: 'child', label: 'Child age,\nsex', x: 330, y: 405 }
    ],
    edges: [['state', 'res'], ['state', 'fuel'], ['state', 'ari'], ['res', 'fuel'], ['res', 'wealth'], ['res', 'edu'], ['res', 'ari'],
      ['wealth', 'fuel'], ['wealth', 'kitchen'], ['edu', 'fuel'], ['edu', 'ari'], ['fuel', 'ari'], ['kitchen', 'ari'], ['child', 'ari']]
  }
});
