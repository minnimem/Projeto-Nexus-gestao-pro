import { DEFAULT_STOCK_MINIMUM } from "../../../utils/stock";

export const initialProductForm = {
  sku: "",
  codBarras: "",
  nomeProduto: "",
  descricao: "",
  ncm: "",
  cfop: "",
  cest: "",
  origemFiscal: "",
  unidadeComercial: "UN",
  cstIcms: "",
  csosn: "",
  aliquotaIcms: "",
  aliquotaPis: "",
  aliquotaCofins: "",
  aliquotaIpi: "",
  codigoServicoMunicipal: "",
  codigoServicoNacional: "",
  aliquotaIss: "",
  precoCompra: "",
  precoVenda: "",
  descontoPercentual: 0,
  qtaMinimo: DEFAULT_STOCK_MINIMUM,
  qtaMaximo: "",
  garantiaMes: 0,
  idCategoria: "",
  idMarca: "",
  idFornecedor: "",
};

export const initialProductCategoryForm = {
  nome: "",
  descricao: "",
};

export const initialBrandForm = {
  nome: "",
  descricao: "",
};

export const initialSupplierForm = {
  nome: "",
  tipoDocumento: "CNPJ",
  documento: "",
  telefone: "",
  email: "",
  endereco: "",
};

export const initialPurchaseForm = {
  produtoId: "",
  fornecedorId: "",
  quantidade: 1,
  valorTotal: "",
  metodoPagamento: "BOLETO",
  status: "PENDENTE",
  dataVencimento: "",
  numeroDocumento: "",
  observacao: "",
};

export const initialInventoryCountForm = {
  produtoId: "",
  quantidadeContada: "",
  observacao: "",
};

export const initialStockTransferForm = {
  produtoId: "",
  origem: "GERAL",
  destino: "",
  quantidade: 1,
  observacao: "",
};
