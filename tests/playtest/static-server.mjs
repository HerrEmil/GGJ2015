// Minimal dependency-free static file server for the Playwright harness.
// Usage: node static-server.mjs <rootDir> <port>
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.argv[2] || "src";
const port = Number(process.argv[3] || 5051);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".json": "application/json",
};

const server = http.createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath === "/") urlPath = "/index.html";
    // Prevent path traversal; resolve within root.
    const filePath = join(root, normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
    const body = await readFile(filePath);
    res.writeHead(200, { "content-type": MIME[extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`static-server: serving ${root} on http://127.0.0.1:${port}`);
});
