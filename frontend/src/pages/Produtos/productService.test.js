import assert from "node:assert/strict";
import test from "node:test";

import { productService } from "./services/productService.js";

function mockJsonResponse(data, ok = true) {
  return {
    ok,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

test("produto service lista, busca, cria, edita e exclui produtos", async () => {
  const calls = [];
  globalThis.sessionStorage = { getItem: () => null };
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, method: options.method || "GET", body: options.body ? JSON.parse(options.body) : null });
    return mockJsonResponse({ ok: true });
  };

  await productService.listProducts();
  await productService.searchProducts("notebook pro");
  await productService.createProduct({ nomeProduto: "Notebook" });
  await productService.updateProduct("p1", { nomeProduto: "Notebook Pro" });
  await productService.removeProduct("p1");

  assert.deepEqual(calls, [
    { url: "http://localhost:8081/produtos", method: "GET", body: null },
    { url: "http://localhost:8081/produtos/buscarnome=notebook%20pro", method: "GET", body: null },
    { url: "http://localhost:8081/produtos", method: "POST", body: { nomeProduto: "Notebook" } },
    { url: "http://localhost:8081/produtos/p1", method: "PUT", body: { nomeProduto: "Notebook Pro" } },
    { url: "http://localhost:8081/produtos/p1", method: "DELETE", body: null },
  ]);
});

test("produto service cobre estoque, compra e cadastros auxiliares", async () => {
  const calls = [];
  globalThis.sessionStorage = { getItem: () => null };
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, method: options.method || "GET", body: options.body ? JSON.parse(options.body) : null });
    return mockJsonResponse({ id: "ok" });
  };

  await productService.stockEntry("p1", 5);
  await productService.stockExit("p1", 2);
  await productService.adjustStock({ produtoId: "p1", quantidade: 10 });
  await productService.transferStock({ produtoId: "p1", origem: "GERAL", destino: "f1", quantidade: 3 });
  await productService.createPurchase({ produtoId: "p1", quantidade: 4 });
  await productService.createCategory({ nome: "Eletronicos" });
  await productService.createBrand({ nome: "Nexus" });
  await productService.createSupplier({ nome: "Fornecedor" });

  assert.equal(calls.length, 8);
  assert.equal(calls[0].url, "http://localhost:8081/estoque/entrada/p1quantidade=5");
  assert.equal(calls[1].url, "http://localhost:8081/estoque/saida/p1quantidade=2");
  assert.equal(calls[2].url, "http://localhost:8081/estoque/ajuste");
  assert.equal(calls[3].url, "http://localhost:8081/estoque/transferencia");
  assert.equal(calls[4].url, "http://localhost:8081/compras");
  assert.equal(calls[5].url, "http://localhost:8081/categorias");
  assert.equal(calls[6].url, "http://localhost:8081/marcas");
  assert.equal(calls[7].url, "http://localhost:8081/fornecedores");
});
