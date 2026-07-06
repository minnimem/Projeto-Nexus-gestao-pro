import { modules } from "./modules.js";

export const initialUserForm = {
  nome: "",
  login: "",
  senha: "",
  perfil: "VENDEDOR",
  filialId: "",
  cargo: "",
  departamento: "",
  salario: "",
  metaVendas: "",
  dataInicio: "",
  telefone: "",
  email: "",
  documento: "",
};

export const editableProfiles = ["GERENTE", "VENDEDOR", "OPERADOR_CAIXA", "ESTOQUISTA", "FINANCEIRO"];

export const initialCompanyForm = {
  nome: "",
  razaoSocial: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  uf: "",
  cep: "",
  codigoMunicipio: "",
  inscricaoEstadual: "",
  inscricaoMunicipal: "",
  regimeTributario: "",
  crt: "",
  estoqueMinimoPadrao: 5,
};

export const initialPlanForm = {
  planoComercial: "STARTER",
  statusAssinatura: "TESTE",
  limiteUsuarios: 3,
  limiteFiliais: 1,
  limiteCaixas: 1,
  limiteProdutos: 500,
  valorMensalPlano: "",
  diaVencimentoPlano: 10,
  ultimoPagamentoPlano: "",
  fiscalLiberado: false,
  pagamentosLiberado: false,
  notificacoesLiberado: false,
  logisticaLiberada: false,
  servicosLiberado: false,
  auditoriaAvancadaLiberada: false,
};

export const planMonthlyValues = {
  STARTER: 149,
  BUSINESS: 299,
  ENTERPRISE: 699,
};

export const initialMasterCompanyForm = {
  nome: "",
  razaoSocial: "",
  cnpj: "",
  telefone: "",
  email: "",
  cidade: "",
  uf: "",
  planoComercial: "STARTER",
  statusAssinatura: "TESTE",
  limiteUsuarios: 3,
  limiteFiliais: 1,
  limiteCaixas: 1,
  limiteProdutos: 500,
  fiscalLiberado: false,
  pagamentosLiberado: false,
  notificacoesLiberado: false,
  logisticaLiberada: false,
  servicosLiberado: false,
  auditoriaAvancadaLiberada: false,
  adminNome: "",
  adminLogin: "",
  adminSenha: "",
  adminEmail: "",
  adminTelefone: "",
};

export const liberationModules = [
  { modulo: "FISCAL", label: "Fiscal real" },
  { modulo: "PAGAMENTOS", label: "Pagamentos reais" },
  { modulo: "NOTIFICACOES", label: "Notificações externas" },
  { modulo: "LOGISTICA", label: "Logística" },
  { modulo: "SERVICOS", label: "Serviços/OS" },
  { modulo: "AUDITORIA", label: "Auditoria avançada" },
];

export const liberationStatuses = [
  "BLOQUEADO",
  "CONTRATADO",
  "PENDENTE_HOMOLOGACAO",
  "HOMOLOGADO",
  "LIBERADO_PRODUCAO",
  "SUSPENSO",
];

export const initialBranchForm = {
  nome: "",
  codigo: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  uf: "",
  matriz: false,
  ativo: true,
};

export const initialContractForm = {
  nome: "",
  numero: "",
  tipo: "Servico",
  status: "ATIVO",
  dataInicio: "",
  dataFim: "",
  valorMensal: "",
  filialId: "",
  observacao: "",
};

export const initialFiscalConfigForm = {
  filialId: "",
  modelo: "NFE",
  ambiente: "HOMOLOGACAO",
  ativo: false,
  serie: "",
  proximoNumero: "",
  provedor: "",
  provedorTokenEnv: "",
  certificadoAlias: "",
  certificadoArquivoEnv: "",
  certificadoSenhaEnv: "",
  certificadoValidoAte: "",
  cscId: "",
  cscTokenEnv: "",
  endpointHomologacao: "",
  endpointProducao: "",
  observacao: "",
};

export const userPermissionModules = modules.filter((module) => module.value !== "usuarios");
export const userPermissionActions = [
  { key: "manageCommercialFollowUp", label: "Gerir follow-up comercial" },
  { key: "mutateFinance", label: "Movimentar financeiro" },
  { key: "reverseFinance", label: "Estornar financeiro" },
  { key: "seeProfit", label: "Ver lucro" },
  { key: "editRoute", label: "Editar rotas" },
  { key: "printRoute", label: "Imprimir rotas" },
  { key: "managePlans", label: "Gerenciar planos comerciais" },
];
