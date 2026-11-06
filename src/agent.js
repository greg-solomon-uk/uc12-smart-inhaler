import { CONTENT_VERSION, SOURCES } from "./sources.js";
import { topics, contentNodes } from "./knowledge.js";
import { rules, safetyNodes } from "./safety.js";

export const MAX_MESSAGE_LENGTH = 500;
export const nodes = { ...contentNodes, ...safetyNodes };

const DEFAULT_OPTIONS = ["Main menu"];
const YES = new Set(["yes", "y", "yeah", "yep", "yup", "ya", "ok", "okay", "sure", "i do", "it is", "it did", "correct", "please", "yes please"]);
const NO = new Set(["no", "n", "nope", "nah", "not really", "i don't", "i dont", "it isn't", "it isnt", "it didn't", "it didnt", "no thanks"]);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const compiledTopics = topics.map(({ node, keywords }) => ({
  node,
  keywords: keywords.map((kw) => {
    const stem = kw.endsWith("*");
    const word = stem ? kw.slice(0, -1) : kw;
    return { weight: word.split(" ").length, re: new RegExp(`(?:^| )${escape(word)}${stem ? "" : "(?= |$)"}`) };
  })
}));

export function normalise(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function exactOption(node, text) {
  return node?.options?.find((o) => normalise(o.label) === text) ?? null;
}

function fuzzyOption(node, text) {
  if (!node?.options) return null;
  const first = text.split(" ")[0];
  const want = YES.has(text) || YES.has(first) ? "yes" : NO.has(text) || NO.has(first) ? "no" : null;
  return want ? node.options.find((o) => normalise(o.label).startsWith(want)) ?? null : null;
}

export function checkSafety(text) {
  return rules.find((r) => r.patterns?.some((p) => p.test(text)) || r.test?.(text)) ?? null;
}

function matchTopic(text) {
  let best = null;
  let bestScore = 0;
  for (const topic of compiledTopics) {
    const score = topic.keywords.reduce((sum, kw) => (kw.re.test(text) ? sum + kw.weight : sum), 0);
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  return best?.node ?? null;
}

function render(nodeId, ruleId = null) {
  const node = nodes[nodeId];
  return {
    reply: node.text,
    ask: node.ask ?? null,
    options: node.options ? node.options.map((o) => o.label) : DEFAULT_OPTIONS,
    source: SOURCES[node.source],
    escalation: node.escalation ?? null,
    safetyRule: ruleId ?? node.escalation?.rule ?? null,
    context: { pending: node.options?.length ? nodeId : null },
    contentVersion: CONTENT_VERSION
  };
}

export function respond(message, context) {
  const text = normalise(String(message ?? "").slice(0, MAX_MESSAGE_LENGTH));
  if (!text) return render("welcome");

  const pendingId = typeof context?.pending === "string" && Object.hasOwn(nodes, context.pending) ? context.pending : null;
  const exact = exactOption(nodes[pendingId], text);
  if (exact) return render(exact.goto);

  // Safety runs before fuzzy yes/no so "no, I can't breathe" is never read as a plain "no".
  const rule = checkSafety(text);
  if (rule) return render(rule.node, rule.id);

  const fuzzy = fuzzyOption(nodes[pendingId], text);
  if (fuzzy) return render(fuzzy.goto);

  return render(matchTopic(text) ?? "fallback");
}
