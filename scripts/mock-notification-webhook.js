import http from "node:http";

const port = Number(process.env.MOCK_NOTIFICATION_PORT || 8099);
const expectedToken = process.env.MOCK_NOTIFICATION_TOKEN || "";

const server = http.createServer((request, response) => {
  if (request.method !== "POST") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  if (expectedToken && request.headers["x-nexus-token"] !== expectedToken) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "invalid_token" }));
    return;
  }

  let body = "";
  request.setEncoding("utf8");
  request.on("data", (chunk) => {
    body += chunk;
  });

  request.on("end", () => {
    let payload;
    try {
      payload = body ? JSON.parse(body) : {};
    } catch {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "invalid_json" }));
      return;
    }

    const receivedAt = new Date().toISOString();
    console.log(JSON.stringify({
      receivedAt,
      path: request.url,
      tokenPresent: Boolean(request.headers["x-nexus-token"]),
      payload,
    }, null, 2));

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ received: true, receivedAt }));
  });
});

server.listen(port, () => {
  console.log(`Mock notification webhook listening on http://localhost:${port}`);
  console.log("Use NOTIFICATIONS_WEBHOOK_URL=http://localhost:" + port + "/nexus-notifications");
});
