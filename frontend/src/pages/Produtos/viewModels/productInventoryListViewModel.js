import { asList, formatCurrency, formatNumber } from "../../../utils/formatters.js";

export function createProductInventoryListViewModel({
  branchFilteredProducts,
  branchScopedStock,
  getFilteredProductMinimum,
  getFilteredProductStock,
  labelPreviewProductId,
  pedidos,
  productPage,
  produtos,
  search,
  selectedInventoryBranchLabel,
}) {
  const filteredProducts = branchFilteredProducts.filter((produto) => {
    const text = `${produto.nome || ""} ${produto.codigoBarras || ""} ${produto.categoria || ""} ${produto.marca || ""} ${produto.fornecedor || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });
  const productPageSize = 10;
  const productTotalPages = Math.max(Math.ceil(filteredProducts.length / productPageSize), 1);
  const currentProductPage = Math.min(productPage, productTotalPages - 1);

  const inventoryRows = filteredProducts.map((produto) => ({
    Produto: produto.nome || "Produto sem nome",
    Código: produto.codigoBarras || "-",
    SKU: produto.sku || "-",
    NCM: produto.ncm || "-",
    CFOP: produto.cfop || "-",
    "CST ICMS": produto.cstIcms || "-",
    CSOSN: produto.csosn || "-",
    "ICMS %": produto.aliquotaIcms || "-",
    "PIS %": produto.aliquotaPis || "-",
    "COFINS %": produto.aliquotaCofins || "-",
    "IPI %": produto.aliquotaIpi || "-",
    "Serviço municipal": produto.codigoServicoMunicipal || "-",
    "Serviço nacional": produto.codigoServicoNacional || "-",
    "ISS %": produto.aliquotaIss || "-",
    Categoria: produto.categoria || "-",
    Marca: produto.marca || "-",
    Fornecedor: produto.fornecedor || "-",
    Preço: formatCurrency(produto.precoComDesconto || produto.precoVenda || 0),
    "Preço base": formatCurrency(produto.precoVenda || 0),
    Lucro: formatCurrency(produto.lucro || 0),
    Estoque: formatNumber(getFilteredProductStock(produto)),
    "Estoque mínimo": formatNumber(getFilteredProductMinimum(produto)),
    Filial: selectedInventoryBranchLabel,
    Status: produto.ativo ? "ATIVO" : "INATIVO",
  }));

  const soldProductKeys = new Set();
  pedidos.forEach((pedido) => {
    asList(pedido.itens).forEach((item) => {
      [item.produtoId, item.idProduto, item.codigoBarras, item.produto, item.nomeProduto]
        .filter(Boolean)
        .forEach((value) => soldProductKeys.add(String(value).toLowerCase()));
    });
  });
  const staleStockProducts = branchFilteredProducts
    .filter((produto) => getFilteredProductStock(produto) > 0)
    .filter((produto) => {
      const keys = [produto.id, produto.idProduto, produto.codigoBarras, produto.nome, produto.nomeProduto]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return keys.every((key) => !soldProductKeys.has(key));
    })
    .slice(0, 8);

  return {
    currentProductPage,
    filteredProducts,
    inventoryRows,
    labelPreviewProduct: produtos.find((produto) => String(produto.id) === String(labelPreviewProductId)) || filteredProducts[0] || null,
    paginatedProducts: filteredProducts.slice(
      currentProductPage * productPageSize,
      currentProductPage * productPageSize + productPageSize,
    ),
    productPageSize,
    productTotalPages,
    staleStockProducts,
    staleStockRows: staleStockProducts.map((produto) => ({
      Produto: produto.nome || "Produto sem nome",
      Código: produto.codigoBarras || "-",
      Filial: selectedInventoryBranchLabel,
      Estoque: formatNumber(getFilteredProductStock(produto)),
      "Preço venda": formatCurrency(produto.precoComDesconto || produto.precoVenda || 0),
      Status: produto.ativo ? "ATIVO" : "INATIVO",
      Observação: pedidos.length > 0 ? "Sem venda encontrada nos pedidos carregados" : "Pedidos não carregados",
    })),
    stockLocationRows: branchScopedStock.map((saldo) => ({
      Produto: saldo.produto || "Produto sem nome",
      Código: saldo.codigoBarras || "-",
      Filial: saldo.filial || "Empresa",
      Local: saldo.localizacao || "GERAL",
      Quantidade: formatNumber(saldo.quantidade || 0),
      "Estoque mínimo": saldo.qtaMinimo == null ? "-" : formatNumber(saldo.qtaMinimo),
      "Estoque máximo": saldo.qtaMaximo == null ? "-" : formatNumber(saldo.qtaMaximo),
    })),
  };
}
