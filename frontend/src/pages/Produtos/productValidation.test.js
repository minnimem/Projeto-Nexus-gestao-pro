import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeProductForm, validateProductForm } from "./services/productValidation.js";

const validForm = {
  sku: " SKU-1 ",
  codBarras: "",
  nomeProduto: " Notebook Pro ",
  descricao: " Produto premium ",
  ncm: " 84713012 ",
  cfop: " 5102 ",
  cest: " 2104300 ",
  origemFiscal: " 0 ",
  unidadeComercial: " UN ",
  cstIcms: " 00 ",
  csosn: "",
  aliquotaIcms: "18",
  aliquotaPis: "1.65",
  aliquotaCofins: "7.6",
  aliquotaIpi: "",
  codigoServicoMunicipal: "",
  codigoServicoNacional: "",
  aliquotaIss: "",
  precoCompra: "1000",
  precoVenda: "1500",
  descontoPercentual: "10",
  qtaMinimo: "2",
  qtaMaximo: "10",
  garantiaMes: "12",
  idCategoria: "cat1",
  idMarca: "m1",
  idFornecedor: "f1",
};

test("valida campos comerciais e limites de estoque do produto", () => {
  assert.equal(validateProductForm({ ...validForm, nomeProduto: " " }).message, "Informe o nome do produto.");
  assert.equal(validateProductForm({ ...validForm, precoCompra: "0" }).message, "Informe preços maiores que zero.");
  assert.equal(validateProductForm({ ...validForm, precoVenda: "-1" }).message, "Informe preços maiores que zero.");
  assert.equal(validateProductForm({ ...validForm, descontoPercentual: "101" }).message, "Desconto deve ficar entre 0% e 100%.");
  assert.equal(validateProductForm({ ...validForm, qtaMinimo: "-1" }).message, "Limites de estoque não podem ser negativos.");
  assert.equal(validateProductForm({ ...validForm, qtaMinimo: "11", qtaMaximo: "10" }).message, "Estoque mínimo não pode ser maior que o estoque máximo.");
});

test("valida duplicidade de produto por nome", () => {
  const result = validateProductForm(validForm, [{ nome: "Notebook Pro" }]);

  assert.equal(result.valid, false);
  assert.match(result.message, /já existe/);
});

test("normaliza dados comerciais, fiscais, categoria, marca e fornecedor", () => {
  const result = validateProductForm(validForm);
  const payload = sanitizeProductForm(validForm, "7891234567890");

  assert.equal(result.valid, true);
  assert.equal(payload.codBarras, "7891234567890");
  assert.equal(payload.nomeProduto, "Notebook Pro");
  assert.equal(payload.sku, "SKU-1");
  assert.equal(payload.ncm, "84713012");
  assert.equal(payload.cfop, "5102");
  assert.equal(payload.cest, "2104300");
  assert.equal(payload.unidadeComercial, "UN");
  assert.equal(payload.precoCompra, 1000);
  assert.equal(payload.precoVenda, 1500);
  assert.equal(payload.descontoPercentual, 10);
  assert.equal(payload.qtaMinimo, 2);
  assert.equal(payload.qtaMaximo, 10);
  assert.equal(payload.idCategoria, "cat1");
  assert.equal(payload.idMarca, "m1");
  assert.equal(payload.idFornecedor, "f1");
  assert.equal(payload.aliquotaIcms, 18);
  assert.equal(payload.aliquotaIpi, null);
});
