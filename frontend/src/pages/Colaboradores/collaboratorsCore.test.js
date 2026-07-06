import assert from "node:assert/strict";
import test from "node:test";
import { buildUserPayload } from "../Usuarios/utils/userPayload.js";
import {
  getCollaboratorDepartment,
  getCollaboratorHierarchyRole,
  getCollaboratorInitials,
  getCollaboratorShift,
  getCollaboratorWorkStatus,
} from "./viewModels/collaboratorViewModel.js";
import { buildCollaboratorGovernanceViewModel } from "./viewModels/collaboratorGovernanceViewModel.js";

const users = [
  {
    id: "user-1",
    nome: "Ana Gerente",
    login: "ana",
    perfil: "GERENTE",
    filialId: "filial-1",
    filial: "Loja Centro",
    cargo: "Gerente Comercial",
    departamento: "Vendas",
    turno: "Comercial",
    metaVendas: 50000,
    ativo: true,
    permissoesExtras: ["financeiro:baixar"],
  },
  {
    id: "user-2",
    nome: "Bruno Operador",
    login: "bruno",
    perfil: "VENDEDOR",
    filialId: "",
    cargo: "",
    departamento: "",
    escala: "12x36",
    ativo: true,
  },
  {
    id: "user-3",
    nome: "Carla Estoque",
    login: "carla",
    perfil: "ESTOQUISTA",
    filialId: "filial-2",
    filial: "Loja Norte",
    cargo: "Estoquista",
    setor: "Estoque",
    ativo: false,
    permissoesBloqueadas: ["financeiro"],
  },
];

const audit = [
  {
    usuarioLogin: "ana",
    modulo: "FINANCEIRO",
    acao: "BAIXAR_CONTA",
    descricao: "Baixa de conta validada",
    dataEvento: "2026-07-05T12:00:00.000Z",
    ip: "127.0.0.1",
  },
  {
    usuarioLogin: "carla",
    modulo: "ACESSO",
    acao: "BLOQUEIO",
    descricao: "Usuario inativado",
    dataEvento: "2026-07-04T12:00:00.000Z",
  },
];

const getUserBranchLabel = (user) => user.filial || (user.filialId ? "Filial" : "Empresa / sem filial");

test("colaboradores normaliza identidade, cargo, departamento, escala e vinculo", () => {
  assert.equal(getCollaboratorInitials(users[0]), "AG");
  assert.equal(getCollaboratorDepartment(users[0]), "Vendas");
  assert.equal(getCollaboratorDepartment(users[1]), "Sem setor");
  assert.equal(getCollaboratorShift(users[1]), "12x36");
  assert.equal(getCollaboratorWorkStatus(users[2]).key, "INATIVO");
  assert.equal(getCollaboratorHierarchyRole(users[0]), "LIDER");
});

test("colaboradores monta payload de criacao e edicao de usuario colaborador", () => {
  const payload = buildUserPayload({
    nome: "  Diego Silva  ",
    login: " diego ",
    senha: "123",
    perfil: "VENDEDOR",
    filialId: "filial-1",
    cargo: "Vendedor",
    departamento: "Comercial",
    salario: "2500.50",
    metaVendas: "10000",
    dataInicio: "2026-07-01",
    telefone: "11999999999",
    email: "diego@nexus.test",
    documento: "12345678900",
  }, true);

  assert.equal(payload.nome, "Diego Silva");
  assert.equal(payload.login, "diego");
  assert.equal(payload.senha, "123");
  assert.equal(payload.cargo, "Vendedor");
  assert.equal(payload.departamento, "Comercial");
  assert.equal(payload.salario, 2500.5);
  assert.equal(payload.metaVendas, 10000);

  const editPayload = buildUserPayload({ ...payload, senha: "" }, false);
  assert.equal(editPayload.senha, null);
});

test("colaboradores valida riscos, auditoria, permissoes e cobertura operacional", () => {
  const viewModel = buildCollaboratorGovernanceViewModel({
    auditoria: audit,
    filteredUsers: users,
    getUserBranchLabel,
    usuarios: users,
  });

  assert.equal(viewModel.permissionCoverageCards.find((card) => card.key === "manual").value, "2");
  assert.equal(viewModel.permissionCoverageRows.length, 3);
  assert.equal(viewModel.permissionProfileRows.some((row) => row.perfil === "GERENTE"), true);

  const brunoIssue = viewModel.collaboratorIssueRows.find((row) => row.usuario.login === "bruno");
  assert.equal(brunoIssue.action, "Vincular filial");
  assert.equal(brunoIssue.issues.includes("Cargo pendente"), true);
  assert.equal(brunoIssue.issues.includes("Setor pendente"), true);
  assert.equal(brunoIssue.issues.includes("Sem auditoria recente"), true);

  assert.equal(viewModel.usersWithoutAudit.map((row) => row.usuario.login).includes("bruno"), true);
  assert.equal(viewModel.recentSensitiveAudit[0].usuario.login, "ana");
  assert.equal(viewModel.collaboratorAuditRows.length, 3);
  assert.equal(viewModel.collaboratorIssueExportRows.some((row) => row.Login === "bruno"), true);
});
