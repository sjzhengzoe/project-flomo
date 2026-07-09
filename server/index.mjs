import http from "node:http";

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);

  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendNotFound(res) {
  sendJson(res, 404, {
    ok: false,
    error: "Not Found",
  });
}

function handleApiRequest(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      service: "project-flomo-server",
      uptime: Math.round(process.uptime()),
    });
    return;
  }

  sendNotFound(res);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || host}`);

  if (requestUrl.pathname.startsWith("/api/")) {
    handleApiRequest(req, res, requestUrl.pathname);
    return;
  }

  sendNotFound(res);
});

server.listen(port, host, () => {
  console.log(`project-flomo server listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`received ${signal}, shutting down server`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
