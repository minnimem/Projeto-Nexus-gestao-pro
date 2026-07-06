import assert from "node:assert/strict";
import test from "node:test";
import { api } from "./api.js";
import { endpoints } from "./resources.js";

function captureApiCalls() {
  const original = {
    get: api.get,
    post: api.post,
    put: api.put,
    patch: api.patch,
    delete: api.delete,
  };
  const calls = [];

  for (const method of Object.keys(original)) {
    api[method] = async (path, body) => {
      calls.push({ method, path, body });
      return { ok: true };
    };
  }

  return {
    calls,
    restore() {
      Object.assign(api, original);
    },
  };
}

test("contratos de endpoints mantem integracao financeiro, pedido e caixa", async () => {
  const recorder = captureApiCalls();

  try {
    await endpoints.financeiro.atualizar("fin-1", { valor: 100 });
    await endpoints.financeiro.gerarCobranca("fin-1");
    await endpoints.pedidos.gerarCobranca("pedido-1", { metodoPagamento: "PIX" });
    await endpoints.caixas.pagamentoRecebido("caixa-1", { financeiroId: "fin-1", valor: 100 });

    assert.deepEqual(recorder.calls, [
      { method: "put", path: "/financeiro/fin-1", body: { valor: 100 } },
      { method: "patch", path: "/financeiro/fin-1/gerar-cobranca", body: undefined },
      { method: "patch", path: "/pedidos/pedido-1/gerar-cobranca", body: { metodoPagamento: "PIX" } },
      { method: "post", path: "/caixas/caixa-1/pagamento-recebido", body: { financeiroId: "fin-1", valor: 100 } },
    ]);
  } finally {
    recorder.restore();
  }
});
