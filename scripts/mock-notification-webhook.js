import http from "node:http";

const port = Number(process.env.MOCK_NOTIFICATION_PORT || 8099);
const expectedToken = process.env.MOCK_NOTIFICATION_TOKEN || "";

function validateCommercialPayload(payload) {
  const requiredFields = ["canal", "regraAutomacao", "assunto", "mensagem"];
  return requiredFields.filter((field) => !payload[field]);
}

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
    const isCommercialFollowUp = payload?.evento === "FOLLOW_UP_VENCIDO_OU_HOJE" && payload?.tipo === "COMERCIAL";
    const missingCommercialFields = isCommercialFollowUp ? validateCommercialPayload(payload) : [];
    if (missingCommercialFields.length > 0) {
      response.writeHead(422, { "Content-Type": "application/json" });
      response.end(JSON.stringify({
        error: "invalid_commercial_payload",
        missingFields: missingCommercialFields,
      }));
      return;
    }

    const commercialRule = isCommercialFollowUp ? {
      canal: payload.canal || null,
      regraAutomacao: payload.regraAutomacao || null,
      assunto: payload.assunto || null,
      mensagemPreview: payload.mensagem ? String(payload.mensagem).slice(0, 180) : null,
      pedidoId: payload.pedidoId || null,
      pedidoNumero: payload.pedidoNumero || null,
      valor: payload.valor || null,
    } : null;
    console.log(JSON.stringify({
      receivedAt,
      path: request.url,
      tokenPresent: Boolean(request.headers["x-nexus-token"]),
      commercialRule,
      payload,
    }, null, 2));

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      received: true,
      receivedAt,
      commercialReady: isCommercialFollowUp,
    }));
  });
});

server.listen(port, () => {
  console.log(`Mock notification webhook listening on http://localhost:${port}`);
  console.log("Use NOTIFICATIONS_WEBHOOK_URL=http://localhost:" + port + "/nexus-notifications");
  console.log("Commercial follow-up payloads must include canal, regraAutomacao, assunto and mensagem.");
});
