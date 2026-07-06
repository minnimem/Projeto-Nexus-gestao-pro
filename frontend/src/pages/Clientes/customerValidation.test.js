import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeCustomerForm, validateCustomerForm } from "./services/customerValidation.js";

const validForm = {
  nome: " Maria Silva ",
  cpf: "123.456.789-01",
  dataNascimento: "1990-01-10",
  email: " maria@nexus.test ",
  telefone: " 11999990000 ",
  endereco: " Rua A ",
  numero: " 10 ",
  bairro: " Centro ",
  cidade: " Sao Paulo ",
  uf: " sp ",
  cep: "01000-000",
  codigoMunicipio: "3550308",
  inscricaoEstadual: " ISENTO ",
};

test("valida campos obrigatorios do cliente", () => {
  assert.equal(validateCustomerForm({ ...validForm, nome: " " }).message, "Informe o nome do cliente.");
  assert.equal(validateCustomerForm({ ...validForm, cpf: "123" }).message, "CPF precisa ter 11 dígitos.");
  assert.equal(validateCustomerForm({ ...validForm, dataNascimento: "" }).message, "Informe a data de nascimento.");
  assert.equal(validateCustomerForm({ ...validForm, email: " " }).message, "Informe o email do cliente.");
});

test("normaliza dados antes de enviar cliente para API", () => {
  const result = validateCustomerForm(validForm);

  assert.equal(result.valid, true);
  assert.deepEqual(result.customer, {
    ...validForm,
    nome: "Maria Silva",
    cpf: "12345678901",
    email: "maria@nexus.test",
    telefone: "11999990000",
    endereco: "Rua A",
    numero: "10",
    bairro: "Centro",
    cidade: "Sao Paulo",
    uf: "SP",
    cep: "01000000",
    codigoMunicipio: "3550308",
    inscricaoEstadual: "ISENTO",
  });
});

test("sanitizeCustomerForm tolera campos ausentes", () => {
  assert.equal(sanitizeCustomerForm({}).nome, "");
  assert.equal(sanitizeCustomerForm({ cpf: null }).cpf, "");
});
