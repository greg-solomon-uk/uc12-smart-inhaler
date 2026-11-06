import test from "node:test";
import assert from "node:assert/strict";
import { respond, nodes, normalise } from "../src/agent.js";
import { SOURCES } from "../src/sources.js";
import { rules } from "../src/safety.js";

function converse(...messages) {
  let context = {};
  let res;
  for (const message of messages) {
    res = respond(message, context);
    context = res.context;
  }
  return res;
}

test("empty message returns the welcome menu", () => {
  const res = respond("");
  assert.match(res.reply, /BreathLink assistant/);
  assert.ok(res.options.includes("Pair my sensor"));
});

test("every node cites an approved source and every option leads somewhere", () => {
  for (const [id, node] of Object.entries(nodes)) {
    assert.ok(SOURCES[node.source], `${id} has unknown source ${node.source}`);
    for (const option of node.options ?? []) assert.ok(nodes[option.goto], `${id} -> ${option.goto} missing`);
  }
  for (const rule of rules) assert.ok(nodes[rule.node], `${rule.id} -> ${rule.node} missing`);
});

test("everyday language reaches the right topic", () => {
  assert.equal(respond("my puffer won't connect to my phone").context.pending, "pair");
  assert.equal(respond("the light is orange?").context.pending, "lights");
  assert.equal(respond("my puffs aren't showing, it's not recording").context.pending, "not_recording");
  assert.equal(respond("how do I use my inhaler properly").context.pending, "technique");
  assert.equal(respond("I forgot to take my inhaler this morning").context.pending, "missed_dose");
});

test("follow-up questions branch on the patient's answer", () => {
  assert.equal(converse("pair my sensor", "yes", "no").context.pending, "pair_troubleshoot");
  assert.equal(converse("pair my sensor", "nope").context.pending, "pair_no_light");
  assert.match(converse("pair my sensor", "yeah", "yes it did").reply, /all set/);
});

test("emergency phrases escalate immediately", () => {
  for (const message of ["I can't breathe", "my lips are going blue", "my blue inhaler isn't helping", "having a bad asthma attack", "I've got chest pain"]) {
    const res = respond(message);
    assert.equal(res.escalation?.level, "emergency", message);
    assert.ok(res.escalation.actions.some((a) => a.href === "tel:999"));
  }
});

test("safety overrides a pending follow-up question", () => {
  const res = converse("pair my sensor", "no, and now I can't breathe");
  assert.equal(res.escalation?.level, "emergency");
  assert.equal(res.safetyRule, "SR-01");
});

test("symptom triage asks questions before escalating", () => {
  const first = respond("I've been really wheezy today");
  assert.equal(first.escalation, null);
  assert.equal(first.context.pending, "sx_check_1");
  assert.equal(converse("I've been really wheezy today", "yes").escalation.level, "emergency");
  assert.equal(converse("I've been really wheezy today", "no", "yes").escalation.level, "urgent");
  assert.equal(converse("I've been really wheezy today", "no", "no").escalation, null);
});

test("reliever overuse and worsening symptoms are urgent", () => {
  assert.equal(respond("I've used my blue inhaler 6 times today").escalation.level, "urgent");
  assert.equal(respond("using my reliever more than usual").escalation.level, "urgent");
  assert.equal(respond("my asthma is getting worse").escalation.level, "urgent");
});

test("medication changes are referred to a clinician", () => {
  for (const message of ["can I stop my steroid inhaler?", "should I take more puffs", "I want to double my dose"]) {
    assert.equal(respond(message).escalation?.level, "clinician", message);
  }
});

test("side effects are triaged and reportable", () => {
  assert.equal(converse("my voice has gone croaky", "yes").escalation.level, "emergency");
  assert.equal(converse("my voice has gone croaky", "no", "yes").escalation.level, "report");
});

test("device problems are not mistaken for clinical emergencies", () => {
  assert.equal(respond("my sensor isn't working").escalation, null);
  assert.equal(respond("my inhaler isn't working").context.pending, "clarify_not_working");
});

test("unknown input falls back without inventing an answer", () => {
  const res = respond("what's the football score");
  assert.match(res.reply, /approved BreathLink information/);
  assert.ok(res.options.length > 0);
});

test("forged context is ignored", () => {
  assert.doesNotThrow(() => respond("yes", { pending: "__proto__" }));
  assert.doesNotThrow(() => respond("yes", { pending: "toString" }));
  assert.equal(respond("yes", { pending: "nonexistent" }).context.pending, "fallback");
});

test("normalise handles smart quotes and punctuation", () => {
  assert.equal(normalise("  Can\u2019t   BREATHE!! "), "can't breathe");
});
