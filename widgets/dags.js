// Causal diagrams used in the labs. Each is built from a published study.
// Coordinates are for a 420-wide viewBox so the diagrams stay legible on a phone.
window.DAGS = {
  fork: {
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
    title: 'HRT and heart disease', x: 'hrt', y: 'chd', height: 420,
    story: '<p>The Nurses\' Health Study followed 59,337 women. Women taking oestrogen plus progestin had less than half the risk of major coronary heart disease (adjusted RR 0.39). Six years later the Women\'s Health Initiative trial randomised 16,608 women and found more heart disease with the same hormones (HR 1.29).</p><p>Which arrows could produce a protective-looking association in the cohort?</p>',
    src: 'Grodstein et al., N Engl J Med 1996; Writing Group for the WHI Investigators, JAMA 2002.',
    nodes: [
      { id: 'ses', label: 'Education,\nincome', x: 210, y: 45 },
      { id: 'age', label: 'Age', x: 60, y: 215 },
      { id: 'life', label: 'Smoking,\ndiet, BMI', x: 345, y: 150 },
      { id: 'seek', label: 'Health-seeking\n(not measured)', x: 200, y: 190, observed: false },
      { id: 'hrt', label: 'HRT', x: 70, y: 310 },
      { id: 'chd', label: 'CHD', x: 350, y: 310 },
      { id: 'lip', label: 'Lipids, BP\nafter starting', x: 210, y: 380 }
    ],
    edges: [['ses', 'hrt'], ['ses', 'life'], ['ses', 'seek'], ['age', 'hrt'], ['age', 'chd'], ['life', 'chd'],
      ['seek', 'hrt'], ['seek', 'chd'], ['seek', 'life'], ['hrt', 'lip'], ['lip', 'chd'], ['hrt', 'chd']]
  },
  tb: {
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
  height: 600,
  nodes: [
    { id: 'state', label: 'State,\nregion', x: 65, y: 40 },
    { id: 'res', label: 'Rural or\nurban', x: 210, y: 40 },
    { id: 'caste', label: 'Caste,\nreligion', x: 355, y: 40 },
    { id: 'wealth', label: 'Wealth', x: 65, y: 145 },
    { id: 'edu', label: "Mother's\neducation", x: 210, y: 145 },
    { id: 'matage', label: "Mother's\nage", x: 355, y: 145 },
    { id: 'kitchen', label: 'Separate\nkitchen', x: 65, y: 250 },
    { id: 'smoke', label: 'Household\nsmoking', x: 210, y: 250 },
    { id: 'crowd', label: 'Crowding', x: 355, y: 250 },
    { id: 'fuel', label: 'Biomass\nfuel', x: 65, y: 360 },
    { id: 'tbhh', label: 'TB in\nhousehold', x: 355, y: 345 },
    { id: 'nut', label: 'Child\nundernutrition', x: 205, y: 450 },
    { id: 'ari', label: 'ARI, last\n2 weeks', x: 355, y: 450 },
    { id: 'border', label: 'Birth\norder', x: 65, y: 555 },
    { id: 'child', label: 'Child age,\nsex', x: 300, y: 555 }
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
