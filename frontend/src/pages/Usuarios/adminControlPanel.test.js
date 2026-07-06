import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAuditGovernance,
  getAuditActor,
  getAuditCategory,
  getAuditTarget,
} from "./utils/auditGovernanceViewModel.js";
import {
  buildBranchPayload,
  buildCompanyPayload,
  buildContractPayload,
  buildPlanPayload,
} from "./utils/companyPayloads.js";
import { buildCompanyOperationsViewModel } from "./utils/companyOperationsViewModel.js";
import { buildFiscalConfigPayload } from "./utils/fiscalConfigPayload.js";
import { buildModuleLiberationRows } from "./utils/moduleLiberationViewModel.js";
import {
  buildPlanBillingMessage,
  buildPlanBillingPayload,
  buildPlanBillingViewModel,
} from "./utils/planBillingViewModel.js";
import { buildSensitivePermissionGovernance } from "./utils/permissionGovernanceViewModel.js";

const formatNumber = (value) => String(value);

test("admin monta payloads de empresa, plano, filial e contrato", () => {
  assert.deepEqual(buildCompanyPayload({ nome: " Nexus One ", estoqueMinimoPadrao: "8", cnpj: "123" }), {
    nome: "Nexus One",
    estoqueMinimoPadrao: 8,
    cnpj: "123",
  });

  assert.deepEqual(buildPlanPayload({
    planoComercial: "BUSINESS",
    limiteUsuarios: "10",
    limiteFiliais: "3",
    limiteCaixas: "2",
    limiteProdutos: "1500",
    valorMensalPlano: "299",
    diaVencimentoPlano: "15",
    ultimoPagamentoPlano: "",
  }), {
    planoComercial: "BUSINESS",
    limiteUsuarios: 10,
    limiteFiliais: 3,
    limiteCaixas: 2,
    limiteProdutos: 1500,
    valorMensalPlano: 299,
    diaVencimentoPlano: 15,
    ultimoPagamentoPlano: null,
  });

  assert.deepEqual(buildBranchPayload({ nome: " Loja Centro ", uf: " sp ", ativo: true }), {
    nome: "Loja Centro",
    uf: "SP",
    ativo: true,
  });

  assert.deepEqual(buildContractPayload({
    nome: " Contrato mensal ",
    valorMensal: "199.9",
    filialId: "",
    dataInicio: "",
    dataFim: "2026-12-31",
  }), {
    nome: "Contrato mensal",
    valorMensal: 199.9,
    filialId: null,
    dataInicio: null,
    dataFim: "2026-12-31",
  });
});

test("admin valida configuracao fiscal e readiness de empresa", () => {
  const fiscalPayload = buildFiscalConfigPayload({
    filialId: "",
    proximoNumero: "15",
    serie: " 1 ",
    provedor: " prefeitura ",
    provedorTokenEnv: " NF_TOKEN ",
    certificadoAlias: " cert ",
    certificadoArquivoEnv: " CERT_FILE ",
    certificadoSenhaEnv: " CERT_PASS ",
    certificadoValidoAte: "",
    cscId: " 001 ",
    cscTokenEnv: " CSC_TOKEN ",
    endpointHomologacao: " https://homolog.test ",
    endpointProducao: "",
    observacao: " pronto ",
  }, "empresa-1");

  assert.equal(fiscalPayload.empresaId, "empresa-1");
  assert.equal(fiscalPayload.filialId, null);
  assert.equal(fiscalPayload.proximoNumero, 15);
  assert.equal(fiscalPayload.serie, "1");
  assert.equal(fiscalPayload.certificadoSenhaEnv, "CERT_PASS");

  const operations = buildCompanyOperationsViewModel(
    {
      nome: "Nexus One",
      razaoSocial: "Nexus One LTDA",
      cnpj: "12.345.678/0001-90",
      endereco: "Rua A",
      cidade: "Sao Paulo",
      uf: "SP",
      historicoComercial: [{ acao: "CRIAR", dataEvento: "2026-07-05T10:00:00Z" }],
    },
    [{ id: "filial-1", nome: "Loja Centro", cnpj: "123", cidade: "", uf: "", matriz: false, ativo: true }],
    [{ nome: "Contrato", filialId: null, status: "ATIVO", valorMensal: 99 }],
    [{ filialNome: "Empresa", ativo: true, serie: "1", proximoNumero: 15 }],
  );

  assert.equal(operations.branchRows.length, 1);
  assert.equal(operations.contractRows.length, 1);
  assert.equal(operations.activeFiscalConfigs, 1);
  assert.equal(operations.fiscalReadyCount, 1);
  assert.equal(operations.fiscalPendingCount, 1);
});

test("admin valida cobranca de planos, acoes em lote e exportacao", () => {
  const companies = [
    {
      id: "empresa-1",
      nome: "Empresa Ativa",
      planoComercial: "BUSINESS",
      statusAssinatura: "ATIVA",
      valorMensalPlano: 299,
      diaVencimentoPlano: 10,
      ultimoPagamentoPlano: "2099-01-10",
      usuariosAtivos: 5,
      filiais: 2,
    },
    {
      id: "empresa-2",
      nome: "Empresa Pendente",
      planoComercial: "STARTER",
      statusAssinatura: "PENDENTE",
      valorMensalPlano: 149,
      diaVencimentoPlano: 1,
    },
    {
      id: "empresa-3",
      nome: "Empresa Teste",
      planoComercial: "STARTER",
      statusAssinatura: "TESTE",
      valorMensalPlano: 149,
    },
  ];

  const billing = buildPlanBillingViewModel(companies, "COBRAR", ["empresa-2", "empresa-3"]);
  assert.equal(billing.planBillingItems.length, 3);
  assert.equal(billing.planBillingFilteredItems.some((item) => item.id === "empresa-2"), true);
  assert.equal(billing.planBillingRows.length >= 1, true);
  assert.equal(billing.selectedPlanBillingItems.length >= 1, true);
  assert.match(billing.planBillingRecommendedAction, /assinatura|empresa|lembrete/i);

  const message = buildPlanBillingMessage(billing.planBillingItems.find((item) => item.id === "empresa-2"));
  assert.match(message, /Empresa Pendente/);

  const payload = buildPlanBillingPayload(companies[1], "ATIVA", "Pagamento confirmado");
  assert.equal(payload.statusAssinatura, "ATIVA");
  assert.equal(payload.limiteUsuarios, 0);
  assert.equal(payload.observacaoComercial, "Pagamento confirmado");
});

test("admin valida liberacao de modulos e permissoes sensiveis", () => {
  const releases = buildModuleLiberationRows([
    { modulo: "FISCAL", status: "LIBERADO_PRODUCAO", contratado: true, liberado: true },
  ]);
  assert.equal(releases.length > 0, true);
  assert.equal(releases.find((row) => row.modulo === "FISCAL").liberado, true);
  assert.equal(releases.find((row) => row.modulo === "PAGAMENTOS").status, "BLOQUEADO");

  const governance = buildSensitivePermissionGovernance([
    { nome: "Admin", login: "admin", perfil: "ADMIN" },
    { nome: "Vendedor", login: "vend", perfil: "VENDEDOR", permissoesExtras: ["acao:financeiro:baixar"] },
  ], formatNumber);

  assert.equal(governance.sensitivePermissionCards.length > 0, true);
  assert.equal(governance.sensitivePermissionRows.length, governance.sensitivePermissionCards.length);
  assert.equal(governance.sensitiveHardeningRows.length, governance.sensitivePermissionCards.length);
});

test("admin valida auditoria, filtros e usuario ausente sem quebrar painel", () => {
  const audit = buildAuditGovernance([
    {
      usuarioLogin: "admin",
      usuarioNome: "Administrador",
      perfil: "ADMIN",
      modulo: "EMPRESA",
      acao: "EXCLUIR",
      descricao: "Removeu registro",
      entidade: "Empresa",
      registroId: "empresa-1",
      registroNome: "Empresa Teste",
      rota: "/api/empresas/empresa-1",
      dataEvento: "2026-07-05T10:00:00Z",
    },
    {
      usuarioLogin: "fantasma",
      perfil: "ADMIN",
      modulo: "FISCAL",
      acao: "CONFIGURAR",
      descricao: "Configuracao fiscal",
      registroId: "fiscal-1",
      dataEvento: "2026-07-04T10:00:00Z",
    },
  ], [{ login: "admin", filial: "Matriz" }], {
    busca: "empresa",
    modulo: "TODOS",
    acao: "TODOS",
    inicio: "",
    fim: "",
  }, 0);

  assert.equal(audit.filteredAudit.length, 2);
  assert.equal(audit.criticalAuditEvents.length, 2);
  assert.equal(audit.auditRows.some((row) => row.filial === "Matriz"), true);
  const deletionRow = audit.auditRows.find((row) => row.categoria === "EXCLUSAO");
  assert.equal(deletionRow.quemExcluiu, "Administrador");
  assert.equal(deletionRow.registroId, "empresa-1");
  assert.equal(deletionRow.registroNome, "Empresa Teste");
  assert.equal(deletionRow.entidade, "Empresa");
  assert.notEqual(deletionRow.horario, "-");
  assert.equal(audit.auditTotalPages, 1);
  assert.equal(audit.getAuditUserBranch({ usuarioLogin: "fantasma" }), "Empresa / sem filial");

  const companyAudit = buildAuditGovernance(audit.filteredAudit, [{ login: "admin", filial: "Matriz" }], {
    busca: "",
    modulo: "EMPRESA",
    acao: "TODOS",
    inicio: "",
    fim: "",
  }, 0);
  assert.equal(companyAudit.filteredAudit.length, 1);
});

test("admin classifica auditoria por login, permissoes, empresa/plano e fiscal", () => {
  const events = [
    { usuarioLogin: "admin", usuarioNome: "Admin", modulo: "LOGIN", acao: "LOGIN_OK", descricao: "Login realizado", dataEvento: "2026-07-05T09:00:00Z" },
    { usuarioLogin: "admin", modulo: "USUARIOS", acao: "PERMISSAO_ALTERADA", descricao: "Permissao operacional alterada", dataEvento: "2026-07-05T09:10:00Z" },
    { usuarioLogin: "admin", modulo: "EMPRESA", acao: "PLANO_ATUALIZADO", descricao: "Plano BUSINESS aplicado", registroId: "empresa-1", dataEvento: "2026-07-05T09:20:00Z" },
    { usuarioLogin: "fiscal", modulo: "FISCAL", acao: "CONFIGURACAO_FISCAL", descricao: "Certificado fiscal revisado", registroId: "fiscal-1", dataEvento: "2026-07-05T09:30:00Z" },
  ];

  assert.equal(getAuditActor(events[0]), "Admin");
  assert.deepEqual(getAuditTarget(events[2]), {
    entity: "EMPRESA",
    id: "empresa-1",
    name: "Plano BUSINESS aplicado",
  });
  assert.equal(getAuditCategory(events[0]), "LOGIN_ACESSO");
  assert.equal(getAuditCategory(events[1]), "PERMISSAO");
  assert.equal(getAuditCategory(events[2]), "EMPRESA_PLANO");
  assert.equal(getAuditCategory(events[3]), "FISCAL");

  const governance = buildAuditGovernance(events, [{ login: "admin", filial: "Matriz" }], {
    busca: "",
    modulo: "TODOS",
    acao: "TODOS",
    inicio: "2026-07-05",
    fim: "2026-07-05",
  }, 0);

  assert.equal(governance.filteredAudit.length, 4);
  assert.equal(governance.auditRows.some((row) => row.categoria === "LOGIN_ACESSO"), true);
  assert.equal(governance.auditRows.some((row) => row.categoria === "PERMISSAO"), true);
  assert.equal(governance.auditRows.some((row) => row.categoria === "EMPRESA_PLANO"), true);
  assert.equal(governance.auditRows.some((row) => row.categoria === "FISCAL"), true);
});
