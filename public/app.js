const messages = document.querySelector("#messages");
const chips = document.querySelector("#chips");
const form = document.querySelector("#composer-form");
const input = document.querySelector("#message");

let context = {};
let busy = false;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function scrollToEnd() {
  requestAnimationFrame(() => messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" }));
}

function safeHref(href) {
  return /^(tel:\+?\d+|https:\/\/[^\s]+)$/.test(href ?? "") ? href : null;
}

function addUser(text) {
  const row = el("div", "row user");
  row.append(el("div", "bubble", text));
  messages.append(row);
  scrollToEnd();
}

function escalationCard(escalation, rule) {
  const card = el("section", `alert alert-${escalation.level}`);
  card.setAttribute("role", escalation.level === "emergency" ? "alert" : "status");
  card.append(el("strong", "alert-title", escalation.title));
  const actions = el("div", "alert-actions");
  for (const action of escalation.actions ?? []) {
    const href = safeHref(action.href);
    if (!href) continue;
    const link = el("a", "alert-btn", action.label);
    link.href = href;
    if (href.startsWith("https://")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    actions.append(link);
  }
  if (actions.childElementCount) card.append(actions);
  if (rule) card.append(el("p", "alert-rule", `Safety rule ${rule} applied`));
  return card;
}

function addBot(res) {
  const row = el("div", "row bot");
  if (res.escalation) row.append(escalationCard(res.escalation, res.safetyRule));
  const bubble = el("div", "bubble");
  for (const line of res.reply.split("\n")) bubble.append(el("p", null, line));
  if (res.ask) bubble.append(el("p", "ask", res.ask));
  if (res.source) bubble.append(el("p", "source", `${res.source.title} \u00b7 ${res.source.ref}`));
  row.append(bubble);
  messages.append(row);
  renderChips(res.options);
  scrollToEnd();
}

function renderChips(options = []) {
  chips.replaceChildren(...options.map((label) => {
    const chip = el("button", "chip", label);
    chip.type = "button";
    chip.addEventListener("click", () => send(label));
    return chip;
  }));
}

function showTyping() {
  const row = el("div", "row bot typing");
  const bubble = el("div", "bubble");
  bubble.setAttribute("aria-label", "Assistant is typing");
  bubble.append(el("span"), el("span"), el("span"));
  row.append(bubble);
  messages.append(row);
  scrollToEnd();
  return row;
}

async function send(text) {
  if (busy) return;
  busy = true;
  if (text) addUser(text);
  chips.replaceChildren();
  const typing = showTyping();
  try {
    const request = fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, context })
    }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    const [res] = await Promise.all([request, new Promise((r) => setTimeout(r, 650))]);
    context = res.context ?? {};
    typing.remove();
    addBot(res);
  } catch {
    typing.remove();
    addBot({
      reply: "Sorry, I can't connect right now. If you feel unwell, contact your GP, nurse or pharmacist. In an emergency, call 999.",
      options: ["Main menu"]
    });
  } finally {
    busy = false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text || busy) return;
  input.value = "";
  send(text);
});

send("");
