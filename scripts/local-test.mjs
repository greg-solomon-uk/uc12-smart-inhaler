import { respond } from "../src/agent.js";

// Scripted conversations printed as a transcript for review.
const conversations = [
  ["", "my puffer won't connect to my phone", "yes", "no", "No, still stuck"],
  ["the light on the sensor is orange"],
  ["I've been wheezy today", "no", "yes"],
  ["I've used my blue inhaler 6 times today"],
  ["can I stop my steroid inhaler?"],
  ["my voice has gone croaky", "no", "yes"],
  ["I can't breathe properly"]
];

for (const turns of conversations) {
  let context = {};
  console.log("-".repeat(60));
  for (const message of turns) {
    const res = respond(message, context);
    context = res.context;
    if (message) console.log(`PATIENT: ${message}`);
    if (res.escalation) console.log(`  [${res.escalation.level.toUpperCase()} ${res.safetyRule}] ${res.escalation.title}`);
    console.log(`AGENT:   ${res.reply.replaceAll("\n", "\n         ")}`);
    if (res.ask) console.log(`         ${res.ask}`);
    console.log(`         (source: ${res.source.ref}; options: ${res.options.join(" | ") || "none"})`);
  }
}
console.log("-".repeat(60));
console.log("WARNING: Clinical safety review of content and rules required; not performed by automated tests.");
