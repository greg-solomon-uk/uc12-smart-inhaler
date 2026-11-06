// Clinical safety escalation rules (mock CSR-001). Checked before any product content.
// Rules are in priority order: the first match wins.

const CALL_999 = { label: "Call 999", href: "tel:999" };
const CALL_111 = { label: "Call NHS 111", href: "tel:111" };
const CALL_SUPPORT = { label: "Call BreathLink support", href: "tel:08000000000" };
const CALL_SAMARITANS = { label: "Call Samaritans 116 123", href: "tel:116123" };
const YELLOW_CARD = { label: "Report on Yellow Card", href: "https://yellowcard.mhra.gov.uk/" };

const BREATHING = /\b(breath\w*|wheez\w*|cough\w*|chest|asthma|copd|symptoms?)\b/;
const RELIEVER = /\b(reliever|blue (inhaler|one|puffer|pump)|salbutamol|terbutaline)\b/;
const DEVICE = /\b(sensor|app|light|bluetooth|record\w*|connect\w*|pair\w*|battery|charg\w*)\b/;
const WORDS = { three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

function relieverOveruse(t) {
  if (!RELIEVER.test(t)) return false;
  if (/\b(more than usual|more often|a lot|all the time|constantly|keep needing|every hour)\b/.test(t)) return true;
  const m = t.match(/\b(\d+|three|four|five|six|seven|eight|nine|ten) (times|x|puffs)\b/);
  return Boolean(m) && Number(WORDS[m[1]] ?? m[1]) >= 4;
}

export const rules = [
  {
    id: "SR-01", level: "emergency", node: "esc_emergency",
    patterns: [
      /\b(can'?t|cannot|can not|unable to|struggling to|hard to) (breathe|catch my breath|get my breath)\b/,
      /\b(gasping|choking)\b/,
      /\b(can'?t|cannot) (talk|speak|finish)\b|\btoo breathless to\b/,
      /\b(lips?|face|fingers?) (are |is |look |looks )?(going |turning )?(blue|grey|gray)\b|\bturning blue\b/,
      /\bchest pains?\b/,
      /\b(collapsed?|fainted|passed out|unconscious|drowsy|confused)\b/,
      /\b(asthma|severe|bad) attack\b/
    ],
    test: (t) => /\b(not|isn'?t|doesn'?t|didn'?t|no longer|won'?t) (help|work)\w*/.test(t) && (RELIEVER.test(t) || /\b(inhaler|puffer|pump)\b/.test(t) && BREATHING.test(t)) && !DEVICE.test(t)
  },
  {
    id: "SR-02", level: "emergency", node: "esc_allergy",
    patterns: [/\b(throat|tongue|lips?|face|mouth) (is |are |feels? )?(swell\w*|swollen|closing|tight)\b/, /\banaphyla\w*/]
  },
  {
    id: "SR-03", level: "emergency", node: "esc_crisis",
    patterns: [/\b(suicid\w*|kill myself|end my life|self harm\w*|hurt myself|don'?t want to (live|be here))\b/]
  },
  {
    id: "SR-04", level: "urgent", node: "esc_overdose",
    patterns: [/\b(took|taken|used|had) (too many|too much|double|loads of|way more)\b/, /\boverdos\w*/]
  },
  {
    id: "SR-05", level: "urgent", node: "esc_urgent_review",
    test: (t) => relieverOveruse(t)
      || (/\b(worse|worsening|not getting better|not improving)\b/.test(t) && BREATHING.test(t))
      || (/\b(night|wak\w*|awake)\b/.test(t) && BREATHING.test(t))
  },
  {
    id: "SR-06", level: "clinician", node: "esc_dose_change",
    patterns: [
      /\b(increase|double|up|reduce|lower|cut down|cut back|stop|quit|come off|skip|change) (my |the )?(dose|inhaler|preventer|medicine|medication|steroid|tablets)\b/,
      /\b(can|should) i (stop|take more|take less|take extra|use more|use less|switch)\b/,
      /\b(take|use) (more|extra|less) (puffs|doses)\b/
    ]
  },
  {
    id: "SR-07", level: "triage", node: "clarify_not_working",
    test: (t) => /\b(inhaler|puffer|pump)\b/.test(t) && /\b(not|isn'?t|doesn'?t|didn'?t|stopped|won'?t) (work|help)\w*/.test(t) && !DEVICE.test(t)
  },
  {
    id: "SR-08", level: "triage", node: "sx_check_1",
    patterns: [
      /\bwheez\w*/, /\b(tight chest|chest (feels |is )?tight)\b/, /\b(short of breath|shortness of breath|breathless\w*|out of breath)\b/,
      /\b(coughing|bad cough|cough(ing)? a lot)\b/, /\b(asthma|copd) (is )?(bad|playing up|flar\w*)\b/, /\bflare ?up\b/,
      /\b(unwell|poorly|feel(ing)? (ill|rough|awful|terrible|sick))\b/
    ]
  },
  {
    id: "SR-09", level: "report", node: "side_effects",
    patterns: [
      /\bside ?effects?\b/, /\b(sore throat|hoarse|croaky|lost my voice|thrush|white patch\w*|sore mouth)\b/,
      /\b(shaky|shaking|tremor|jittery|heart (racing|pounding)|palpitation\w*|headache)\b/, /\b(rash|itch\w*|reaction)\b/
    ]
  },
  {
    id: "SR-10", level: "handoff", node: "esc_handoff",
    patterns: [/\b(human|real person|a person|someone|speak to|talk to|call me|complain\w*|complaint|nurse|doctor|pharmacist)\b/]
  }
];

export const safetyNodes = {
  esc_emergency: {
    source: "CSR",
    escalation: { level: "emergency", rule: "SR-01", title: "This could be an emergency", actions: [CALL_999] },
    text: "Please call 999 now. Don't wait to see if it passes.\nWhile you wait: sit upright, try to stay calm, and use your reliever inhaler as your action plan says.",
    options: []
  },
  esc_allergy: {
    source: "CSR",
    escalation: { level: "emergency", rule: "SR-02", title: "Possible severe allergic reaction", actions: [CALL_999] },
    text: "Swelling of the face, lips, tongue or throat can be a severe allergic reaction. Call 999 now.\nIf you've been prescribed an adrenaline auto-injector, use it.",
    options: []
  },
  esc_crisis: {
    source: "CSR",
    escalation: { level: "emergency", rule: "SR-03", title: "You don't have to cope alone", actions: [CALL_999, CALL_SAMARITANS] },
    text: "I'm really sorry you're feeling this way. If you're in danger or might act on these thoughts, call 999 now.\nYou can talk to Samaritans for free, any time, on 116 123.",
    options: []
  },
  esc_overdose: {
    source: "CSR",
    escalation: { level: "urgent", rule: "SR-04", title: "Get medical advice now", actions: [CALL_111, CALL_999] },
    text: "Taking more than prescribed can cause shakiness, a fast heartbeat or headache. Call NHS 111 for advice now.\nCall 999 if you have chest pain, a very fast or irregular heartbeat, or feel faint.",
    options: [{ label: "Main menu", goto: "welcome" }]
  },
  esc_urgent_review: {
    source: "PLAN",
    escalation: { level: "urgent", rule: "SR-05", title: "Contact your care team today", actions: [CALL_111, CALL_999] },
    text: "This can be a sign your asthma or COPD isn't well controlled. Follow your action plan and contact your GP surgery or asthma/COPD nurse today.\nIf you can't reach them, call NHS 111. If you get much worse, call 999.",
    options: [{ label: "Main menu", goto: "welcome" }]
  },
  esc_dose_change: {
    source: "CSR",
    escalation: { level: "clinician", rule: "SR-06", title: "Speak to your clinician", actions: [] },
    text: "I can't advise on changing, stopping or adding medicines. That needs your GP, asthma/COPD nurse or pharmacist, who know your history.\nPlease keep taking your medicine as prescribed until you've spoken to them.",
    options: [{ label: "Main menu", goto: "welcome" }]
  },
  esc_handoff: {
    source: "SUPPORT",
    escalation: { level: "handoff", rule: "SR-10", title: "Passing you to a person", actions: [CALL_SUPPORT] },
    text: "BreathLink support can help with the sensor and app, Monday to Friday, 8am to 8pm, on 0800 000 0000.\nFor questions about your health or medicine, contact your GP, nurse or pharmacist.",
    options: [{ label: "Main menu", goto: "welcome" }]
  },
  clarify_not_working: {
    source: "CSR",
    text: "I want to make sure I get you the right help.",
    ask: "Is it your breathing that isn't improving, or the inhaler or sensor that isn't working?",
    options: [{ label: "My breathing", goto: "sx_check_1" }, { label: "The device", goto: "lights" }]
  },
  sx_check_1: {
    source: "CSR",
    text: "I'm sorry you're not feeling well. I'll ask a couple of quick questions so I can point you to the right help.",
    ask: "Are you too breathless to speak in full sentences, or is your reliever not helping?",
    options: [{ label: "Yes", goto: "esc_emergency" }, { label: "No", goto: "sx_check_2" }]
  },
  sx_check_2: {
    source: "CSR",
    text: "Thanks.",
    ask: "In the last few days, have you needed your reliever more than usual, or woken at night with symptoms?",
    options: [{ label: "Yes", goto: "esc_urgent_review" }, { label: "No", goto: "sx_mild" }]
  },
  sx_mild: {
    source: "PLAN",
    text: "Keep taking your preventer as prescribed and use your reliever as your action plan says.\nIf things don't settle, or you need your reliever 3 or more times a week, book a review with your GP or nurse. If you get worse, call NHS 111, or 999 in an emergency.",
    options: [{ label: "Main menu", goto: "welcome" }]
  },
  side_effects: {
    source: "PIL",
    text: "Side effects depend on your medicine. With steroid preventers, some people get a hoarse voice, sore throat or mouth thrush; rinsing your mouth and spitting after each use helps. Relievers can cause brief shakiness or a faster heartbeat.",
    ask: "First, do you have any swelling of your face, lips or throat, or chest pain?",
    options: [{ label: "Yes", goto: "esc_allergy" }, { label: "No", goto: "side_effects_2" }]
  },
  side_effects_2: {
    source: "PIL",
    text: "Thanks.",
    ask: "Is the side effect bothering you, or not going away?",
    options: [{ label: "Yes", goto: "esc_side_effect_report" }, { label: "No", goto: "side_effects_ok" }]
  },
  esc_side_effect_report: {
    source: "PIL",
    escalation: { level: "report", rule: "SR-09", title: "Report this side effect", actions: [YELLOW_CARD] },
    text: "Please speak to your pharmacist, GP or nurse about it. Don't stop your medicine without their advice.\nYou can also report side effects through the MHRA Yellow Card scheme. This helps keep medicines safe.",
    options: [{ label: "Main menu", goto: "welcome" }]
  },
  side_effects_ok: {
    source: "PIL",
    text: "Good. Keep rinsing your mouth after your preventer. If it changes or starts to bother you, tell your pharmacist.",
    options: [{ label: "Main menu", goto: "welcome" }]
  }
};
