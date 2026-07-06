export const serviceOrderStatuses = [
  "ABERTA",
  "EM_ANALISE",
  "APROVADA",
  "EM_EXECUCAO",
  "CONCLUIDA",
  "FATURADA",
  "CANCELADA",
];

export const serviceOrderPriorities = [
  { value: "CRITICA", label: "Crítica", slaHours: 8 },
  { value: "ALTA", label: "Alta", slaHours: 24 },
  { value: "MEDIA", label: "Média", slaHours: 48 },
  { value: "BAIXA", label: "Baixa", slaHours: 96 },
];

export const serviceOrderFlowSteps = [
  { key: "cliente", label: "Cliente" },
  { key: "tecnico", label: "Técnico" },
  { key: "servico", label: "Serviço" },
  { key: "checklist", label: "Checklist" },
  { key: "prazo", label: "Prazo" },
  { key: "finalizar", label: "Finalizar" },
];

export const serviceChecklistTemplates = [
  {
    key: "instalacao",
    label: "Instalação",
    items: ["Validar local de instalação", "Conferir alimentação/conectividade", "Executar instalação", "Testar operação com cliente", "Registrar aceite"],
  },
  {
    key: "manutencao",
    label: "Manutenção",
    items: ["Diagnosticar causa", "Separar peças utilizadas", "Executar reparo", "Testar funcionamento", "Orientar cliente"],
  },
  {
    key: "vistoria",
    label: "Vistoria",
    items: ["Registrar evidência inicial", "Conferir checklist técnico", "Apontar pendências", "Definir próxima ação", "Coletar validação do cliente"],
  },
];

export const serviceKanbanColumns = [
  { key: "ABERTA", label: "Aberta" },
  { key: "EM_ANALISE", label: "Em análise" },
  { key: "APROVADA", label: "Aprovada" },
  { key: "EM_EXECUCAO", label: "Em execução" },
  { key: "CONCLUIDA", label: "Concluída" },
  { key: "FATURADA", label: "Faturada" },
];

export const initialServiceOrderForm = {
  clienteId: "",
  tecnicoId: "",
  filialId: "",
  prioridade: "MEDIA",
  titulo: "",
  descricao: "",
  checklist: "",
  prazo: "",
  valorEstimado: "",
  tipoServico: "AVULSO",
  contratoId: "",
  garantiaCoberta: "NAO",
  garantiaAte: "",
  recorrente: "NAO",
  recorrenciaIntervaloMeses: "1",
  proximaRecorrencia: "",
  pecasUtilizadas: "",
  pecasItens: [],
  pecaProdutoId: "",
  pecaQuantidade: "1",
  evidencias: "",
  assinaturaCliente: "NAO",
  assinaturaClienteNome: "",
  assinaturaClienteDocumento: "",
  assinaturaClienteObservacao: "",
  observacao: "",
};
