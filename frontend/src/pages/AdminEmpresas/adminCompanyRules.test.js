import assert from "node:assert/strict";
import test from "node:test";
import {
  buildControlledAddonPayload,
  buildEditMasterCompanyPayload,
  buildMasterCompanyPayload,
  buildMasterCompanyStatusPayload,
  validateEditMasterCompanyForm,
  validateMasterCompanyForm,
} from "./services/adminCompanyRules.js";
import { getCompanyRiskSignals } from "./viewModels/adminCompanyViewModel.js";

const masterCompanyForm = {
  nome: " Nexus Loja ",
  razaoSocial: " Nexus Loja LTDA ",
  cnpj: " 12.345.678/0001-90 ",
  telefone: " 11999999999 ",
  email: " contato@nexus.test ",
  cidade: " Sao Paulo ",
  uf: " sp ",
  limiteUsuarios: "8",
  limiteFiliais: "2",
  limiteCaixas: "3",
  limiteProdutos: "900",
  adminNome: " Admin Loja ",
  adminLogin: " admin.loja ",
  adminSenha: "123456",
  adminEmail: " admin@nexus.test ",
  adminTelefone: " 11888888888 ",
};

test("admin empresas valida e monta payload de criacao master", () => {
  assert.equal(validateMasterCompanyForm({ ...masterCompanyForm, nome: "" }), "Informe o nome da empresa.");
  assert.equal(validateMasterCompanyForm({ ...masterCompanyForm, adminLogin: "" }), "Informe nome e login do admin inicial.");
  assert.equal(validateMasterCompanyForm({ ...masterCompanyForm, adminSenha: "123" }), "Senha do admin inicial precisa ter no minimo 6 caracteres.");
  assert.equal(validateMasterCompanyForm(masterCompanyForm), "");

  const payload = buildMasterCompanyPayload(masterCompanyForm);
  assert.equal(payload.nome, "Nexus Loja");
  assert.equal(payload.razaoSocial, "Nexus Loja LTDA");
  assert.equal(payload.uf, "SP");
  assert.equal(payload.limiteUsuarios, 8);
  assert.equal(payload.limiteFiliais, 2);
  assert.equal(payload.limiteCaixas, 3);
  assert.equal(payload.limiteProdutos, 900);
  assert.equal(payload.adminNome, "Admin Loja");
  assert.equal(payload.adminLogin, "admin.loja");
});

test("admin empresas valida e monta payload de edicao master", () => {
  const editForm = {
    nome: " Nexus Editada ",
    razaoSocial: "",
    cnpj: "",
    telefone: "",
    email: " contato@nexus.test ",
    endereco: " Rua A ",
    cidade: " Campinas ",
    uf: " sp ",
    cep: " 13000-000 ",
    codigoMunicipio: " 3509502 ",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    regimeTributario: "SIMPLES",
    crt: "1",
    estoqueMinimoPadrao: "12",
  };

  assert.equal(validateEditMasterCompanyForm({ ...editForm, nome: " " }), "Informe o nome da empresa.");
  assert.equal(validateEditMasterCompanyForm(editForm), "");

  const payload = buildEditMasterCompanyPayload(editForm);
  assert.equal(payload.nome, "Nexus Editada");
  assert.equal(payload.razaoSocial, null);
  assert.equal(payload.endereco, "Rua A");
  assert.equal(payload.uf, "SP");
  assert.equal(payload.estoqueMinimoPadrao, 12);
});

test("admin empresas monta payload de status da empresa", () => {
  const inactive = buildMasterCompanyStatusPayload({ id: "empresa-1", ativo: false }, " Reativacao aprovada ");
  assert.deepEqual(inactive.payload, {
    ativo: true,
    observacaoComercial: "Reativacao aprovada",
  });
  assert.equal(inactive.message, "Empresa ativada.");

  const active = buildMasterCompanyStatusPayload({ id: "empresa-1", ativo: true }, "");
  assert.deepEqual(active.payload, {
    ativo: false,
    observacaoComercial: null,
  });
  assert.equal(active.message, "Empresa inativada.");
});

test("admin empresas valida adicionais controlados e riscos", () => {
  const addonPayload = buildControlledAddonPayload({
    modulo: "FISCAL",
    status: "HOMOLOGADO",
    contratado: true,
    responsavel: " Fiscal ",
    evidencia: " Ticket-123 ",
    observacao: " Pronto para liberar ",
  });

  assert.deepEqual(addonPayload, {
    modulo: "FISCAL",
    status: "HOMOLOGADO",
    contratado: true,
    responsavel: "Fiscal",
    evidencia: "Ticket-123",
    observacao: "Pronto para liberar",
  });

  const signals = getCompanyRiskSignals({
    nome: "Empresa",
    statusAssinatura: "ATIVA",
    usuariosAtivos: 8,
    limiteUsuarios: 10,
    filiais: 2,
    limiteFiliais: 2,
    cnpj: "",
    email: "",
    liberacoes: [
      { modulo: "FISCAL", contratado: true, liberado: false },
      { modulo: "LOGISTICA", contratado: true, liberado: true },
    ],
  }).map((signal) => signal.label);

  assert.equal(signals.includes("Usuários 80%+"), true);
  assert.equal(signals.includes("Limite filiais"), true);
  assert.equal(signals.includes("1 adicional(is)"), true);
  assert.equal(signals.includes("Cadastro incompleto"), true);
});
