export const initialFinanceForm = {
  descricao: "",
  tipo: "RECEITA",
  categoria: "Venda",
  valor: "",
  metodoPagamento: "PIX",
  status: "APROVADO",
  dataVencimento: "",
  filialId: "",
  modoLancamento: "UNICO",
  parcelas: 1,
  intervaloMeses: 1,
  observacao: "",
};

export const initialFinanceCategoryForm = {
  nome: "",
  descricao: "",
  centroCusto: true,
};

export const initialCollectionFollowUpForm = {
  financeiroId: "",
  cliente: "",
  canal: "WhatsApp",
  proximaAcao: "",
  observacao: "",
};
