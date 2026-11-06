import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import chat from "../netlify/functions/chat.mjs";
import info from "../netlify/functions/info.mjs";

// Minimal local server mirroring the Netlify redirects. Set HOST=0.0.0.0 to open from a phone on the same network.
const root = fileURLToPath(new URL("../public/", import.meta.url));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8888);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".json": "application/json" };
const MAX_BODY = 10_000;

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error("Body too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}

async function sendResponse(res, response) {
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);
    if (url.pathname === "/api/chat") {
      const body = req.method === "POST" ? await readBody(req) : undefined;
      return sendResponse(res, await chat(new Request(url, { method: req.method, headers: { "Content-Type": "application/json" }, body })));
    }
    if (url.pathname === "/api/info") return sendResponse(res, await info());

    const file = normalize(join(root, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname)));
    if (!file.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" }).end(data);
  } catch {
    if (!res.headersSent) res.writeHead(404).end("Not found");
  }
}).listen(port, host, () => console.log(`Smart inhaler agent running at http://${host}:${port}`));
