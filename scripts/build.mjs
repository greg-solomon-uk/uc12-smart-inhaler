import { access } from "node:fs/promises";
await access(new URL("../public/index.html", import.meta.url));
await access(new URL("../netlify/functions/chat.mjs", import.meta.url));
await access(new URL("../netlify/functions/info.mjs", import.meta.url));
console.log("Build validation passed.");
