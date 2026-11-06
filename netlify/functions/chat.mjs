import { respond, MAX_MESSAGE_LENGTH } from "../../src/agent.js";

export default async (request) => {
  let message = "";
  let context = {};

  if (request.method === "POST") {
    try {
      ({ message = "", context = {} } = await request.json());
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  } else if (request.method === "GET") {
    const url = new URL(request.url);
    message = url.searchParams.get("message") ?? "";
    context = { pending: url.searchParams.get("pending") };
  } else {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "GET, POST" } });
  }

  if (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ error: `message must be text of at most ${MAX_MESSAGE_LENGTH} characters` }, { status: 400 });
  }

  const result = respond(message, context);
  // Audit trail for escalations; message text is deliberately not logged.
  if (result.safetyRule) {
    console.log(JSON.stringify({ event: "safety_rule", rule: result.safetyRule, level: result.escalation?.level ?? "triage" }));
  }
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
};
