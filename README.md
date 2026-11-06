# Smart Inhaler Agent (mock)

A phone-first chatbot mock-up for **BreathLink**, a fictional electronic sensor that clips onto a normal asthma or COPD inhaler. It deploys to Netlify in the same way as the calculator app.

> Demonstration only. All product content, document references and phone numbers (other than 999 / 111 / Samaritans) are mock. Not medical advice.

## What it demonstrates

| Requirement | How the mock does it |
| --- | --- |
| Phone-based support grounded in approved information | All replies come from fixed, reviewed text in [src/knowledge.js](src/knowledge.js) and [src/safety.js](src/safety.js). Nothing is generated. Each reply cites its source document and version from [src/sources.js](src/sources.js). |
| Patients use everyday language | Free text is normalised and matched against everyday phrases ("my puffer won't connect", "the light's orange", "I forgot to take it"). Quick-reply chips are offered too. |
| Advice plus follow-up questions | Each topic is a small decision tree: the agent gives advice, asks a question, and branches on the answer (chip, "yes", "yeah", "nope", etc.). |
| Approved product and safety information | Instructions for use, leaflet, technique guide, action plan guidance, privacy notice and support policy are modelled as versioned sources. |
| Escalation via defined safety rules | Rules SR-01 to SR-10 in [src/safety.js](src/safety.js) are checked on every message **before** product content, and override any pending question. Escalations are logged (rule and level only, no message text). |

## Safety rules

Checked in priority order; the first match wins.

| Rule | Level | Trigger (examples) | Action |
| --- | --- | --- | --- |
| SR-01 | Emergency | "can't breathe", "lips going blue", "reliever isn't helping", chest pain, asthma attack | Call 999 |
| SR-02 | Emergency | Swelling of face, lips, tongue or throat | Call 999 |
| SR-03 | Emergency | Self-harm or suicidal thoughts | Call 999, Samaritans |
| SR-04 | Urgent | Took too much / overdose | NHS 111 (999 if severe) |
| SR-05 | Urgent | Reliever 4+ times or more than usual, worsening symptoms, night symptoms | Contact care team today, NHS 111 |
| SR-06 | Clinician | Stop, increase, reduce or change medicine | Refer to GP, nurse or pharmacist |
| SR-07 | Triage | "My inhaler isn't working" (unclear) | Ask: breathing or device? |
| SR-08 | Triage | Wheezy, breathless, unwell | Ask severity questions, then route to SR-01, SR-05 or self-care advice |
| SR-09 | Report | Side effects | Screen for allergy, then route to Yellow Card reporting |
| SR-10 | Handoff | Wants a person, complaint | BreathLink support |

Rules are deliberately cautious, so false positives escalate rather than reassure.

## Interfaces

- Browser chat: `/`
- Chat API: `POST /api/chat` with `{"message": "...", "context": {"pending": "..."}}`
- Headless check: `/api/chat?message=I%20can%27t%20breathe`
- Release metadata: `/api/info`

Example response:

```json
{
  "reply": "Please call 999 now. ...",
  "ask": null,
  "options": [],
  "source": {"ref": "CSR-001 v1.2", "title": "Clinical Safety Escalation Rules"},
  "escalation": {"level": "emergency", "rule": "SR-01", "title": "This could be an emergency", "actions": [{"label": "Call 999", "href": "tel:999"}]},
  "safetyRule": "SR-01",
  "context": {"pending": null},
  "contentVersion": "2026.11-mock"
}
```

The server is stateless. The browser sends back `context` on each turn.

## Local use

```text
cd smart-inhaler
npm test             # unit tests for routing, follow-ups and safety rules
npm run test:local   # prints sample conversations
npm start            # http://127.0.0.1:8888
```

To try it on a phone on the same network, run `HOST=0.0.0.0 npm start` and open `http://<your-computer-ip>:8888`. Under WSL you may need Windows port forwarding. Deploying a Netlify preview is often easier.

The app has no third-party dependencies.

## Deploy to Netlify

Create a Netlify site from this folder (set the base directory to `smart-inhaler` if it lives inside a larger repository). [netlify.toml](netlify.toml) sets the publish folder, functions, API redirects and security headers (including a strict Content Security Policy).

## Structure

```text
smart-inhaler/
├── netlify/functions/   chat.mjs, info.mjs
├── public/              phone UI (index.html, styles.css, app.js, icon.svg)
├── scripts/             build check, transcript runner, local server
├── src/
│   ├── agent.js         message routing: chip > safety > yes/no answer > topic > fallback
│   ├── knowledge.js     approved product content and follow-up trees
│   ├── safety.js        safety rules and escalation content
│   └── sources.js       approved source documents and content version
└── tests/
```
