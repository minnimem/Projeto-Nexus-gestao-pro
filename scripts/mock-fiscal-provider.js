import http from "node:http";

const port = Number(process.env.MOCK_FISCAL_PORT || 8098);
const expectedToken = process.env.MOCK_FISCAL_TOKEN || "";
const forcedStatus = String(process.env.MOCK_FISCAL_STATUS || "AUTORIZADO").toUpperCase();
const responseMode = String(process.env.MOCK_FISCAL_RESPONSE_MODE || "json").toLowerCase();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload, null, 2));
}

function sendXml(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/xml; charset=utf-8" });
  response.end(payload);
}

function readJsonBody(request, response, callback) {
  let body = "";
  request.setEncoding("utf8");
  request.on("data", (chunk) => {
    body += chunk;
  });
  request.on("end", () => {
    try {
      callback(body ? JSON.parse(body) : {});
    } catch {
      sendJson(response, 400, { error: "invalid_json" });
    }
  });
}

function tokenValido(request) {
  if (!expectedToken) return true;
  return request.headers.authorization === `Bearer ${expectedToken}`;
}

function sanitize(value) {
  return String(value ?? "").replace(/[^A-Za-z0-9]/g, "");
}

function xmlRetorno(payload, status, mensagem) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<RetornoMockFiscal>",
    `<Status>${status}</Status>`,
    `<Modelo>${payload.modelo || ""}</Modelo>`,
    `<Ambiente>${payload.ambiente || ""}</Ambiente>`,
    `<Serie>${payload.serie || ""}</Serie>`,
    `<Numero>${payload.numero || ""}</Numero>`,
    `<Mensagem>${mensagem}</Mensagem>`,
    "</RetornoMockFiscal>",
  ].join("");
}

function nfeProcXml(status, mensagem, chave, protocolo) {
  const autorizado = status === "AUTORIZADO";
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">',
    "<protNFe>",
    "<infProt>",
    `<cStat>${autorizado ? "100" : "539"}</cStat>`,
    `<xMotivo>${mensagem}</xMotivo>`,
    autorizado ? `<chNFe>${chave}</chNFe>` : "",
    autorizado ? `<nProt>${protocolo}</nProt>` : "",
    "</infProt>",
    "</protNFe>",
    "</nfeProc>",
  ].join("");
}

function danfeHtml(payload, chave, protocolo) {
  return [
    "<!doctype html>",
    '<html lang="pt-BR">',
    "<head><meta charset=\"utf-8\"><title>DANFE Mock</title></head>",
    '<body style="font-family:Arial,sans-serif;margin:24px">',
    "<h1>Documento auxiliar fiscal - mock</h1>",
    `<p><strong>Modelo:</strong> ${payload.modelo || ""}</p>`,
    `<p><strong>Serie/numero:</strong> ${payload.serie || ""}/${payload.numero || ""}</p>`,
    `<p><strong>Chave:</strong> ${chave}</p>`,
    `<p><strong>Protocolo:</strong> ${protocolo}</p>`,
    "<p>Documento gerado apenas para homologacao local do Nexus One.</p>",
    "</body></html>",
  ].join("");
}

const server = http.createServer((request, response) => {
  if (request.method === "HEAD") {
    response.writeHead(tokenValido(request) ? 200 : 401);
    response.end();
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "method_not_allowed" });
    return;
  }

  if (!tokenValido(request)) {
    sendJson(response, 401, { error: "invalid_token" });
    return;
  }

  readJsonBody(request, response, (payload) => {
    const autorizado = forcedStatus !== "REJEITADO";
    const status = autorizado ? "AUTORIZADO" : "REJEITADO";
    const mensagem = autorizado
      ? "Documento autorizado pelo mock fiscal local."
      : "Documento rejeitado pelo mock fiscal local.";
    const chave = `MOCK${sanitize(payload.modelo)}${sanitize(payload.ambiente)}${sanitize(payload.serie)}${sanitize(payload.numero)}`;
    const protocolo = `MOCK-${sanitize(payload.serie)}-${sanitize(payload.numero)}-${Date.now()}`;

    console.log(JSON.stringify({
      receivedAt: new Date().toISOString(),
      path: request.url,
      status,
      documentoId: payload.documentoId,
      pedidoId: payload.pedidoId,
      modelo: payload.modelo,
      serie: payload.serie,
      numero: payload.numero,
      xmlLength: String(payload.xmlEnvio || "").length,
    }, null, 2));

    const xml = nfeProcXml(status, mensagem, chave, protocolo);

    if (responseMode === "xml") {
      sendXml(response, 200, xml);
      return;
    }

    if (responseMode === "sefaz-json") {
      sendJson(response, 200, {
        cStat: autorizado ? "100" : "539",
        xMotivo: mensagem,
        chNFe: autorizado ? chave : null,
        nProt: autorizado ? protocolo : null,
        nfeProc: xml,
        danfeHtml: autorizado ? danfeHtml(payload, chave, protocolo) : null,
      });
      return;
    }

    sendJson(response, 200, {
      autorizado,
      status,
      codigoStatus: autorizado ? "100" : "999",
      chaveAcesso: autorizado ? chave : null,
      protocolo: autorizado ? protocolo : null,
      mensagem,
      xmlRetorno: xmlRetorno(payload, status, mensagem),
      danfeHtml: autorizado ? danfeHtml(payload, chave, protocolo) : null,
    });
  });
});

server.listen(port, () => {
  console.log(`Mock fiscal provider listening on http://localhost:${port}`);
  console.log(`Use endpointHomologacao=http://localhost:${port}/fiscal/homologacao`);
  console.log("Use NEXUS_FISCAL_PROVIDER=http");
  console.log("Use MOCK_FISCAL_RESPONSE_MODE=json | sefaz-json | xml");
  if (expectedToken) {
    console.log("Use provedorTokenEnv=MOCK_FISCAL_TOKEN");
  }
});
