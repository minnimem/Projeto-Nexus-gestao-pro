import assert from "node:assert/strict";
import test from "node:test";

import { createProductInventoryListViewModel } from "./viewModels/productInventoryListViewModel.js";
import { createProductPurchaseSummaryViewModel } from "./viewModels/productPurchaseSummaryViewModel.js";
import { createProductStockScopeViewModel } from "./viewModels/productStockScopeViewModel.js";
import { createProductStockSummaryViewModel } from "./viewModels/productStockSummaryViewModel.js";

const produtos = [
  {
    id: "p1",
    nome: "Notebook Pro",
    codigoBarras: "789",
    sku: "NB-1",
    categoria: "Eletronicos",
    marca: "Nexus",
    fornecedor: "Fornecedor A",
    precoVenda: 1500,
    precoComDesconto: 1400,
    lucro: 400,
    quantidadeAtual: 3,
    qtaMinimo: 5,
    ativo: true,
  },
  {
    id: "p2",
    nome: "Mouse",
    codigoBarras: "456",
    precoVenda: 80,
    quantidadeAtual: 20,
    qtaMinimo: 4,
    ativo: true,
  },
];

const estoqueSaldos = [
  {
    produtoId: "p1",
    produto: "Notebook Pro",
    codigoBarras: "789",
    filialId: "f1",
    filial: "Filial Centro",
    localizacao: "PRATELEIRA",
    quantidade: 2,
    qtaMinimo: 3,
    qtaMaximo: 8,
  },
  {
    produtoId: "p2",
    produto: "Mouse",
    codigoBarras: "456",
    filialId: "f2",
    filial: "Filial Norte",
    localizacao: "GERAL",
    quantidade: 7,
    qtaMinimo: 4,
  },
];

test("Produtos valida estoque minimo, estoque baixo e estoque por filial", () => {
  const scope = createProductStockScopeViewModel({
    estoqueSaldos,
    filiais: [{ id: "f1", nome: "Filial Centro" }],
    inventoryBranchFilter: "f1",
  });
  const summary = createProductStockSummaryViewModel({
    branchStockByProduct: scope.branchStockByProduct,
    estoqueBaixoApi: [],
    getFilteredProductMinimum: scope.getFilteredProductMinimum,
    getFilteredProductStock: scope.getFilteredProductStock,
    inventoryBranchFilter: "f1",
    produtos,
  });

  assert.equal(scope.selectedInventoryBranchLabel, "Filial Centro");
  assert.equal(scope.getFilteredProductStock(produtos[0]), 2);
  assert.equal(scope.getFilteredProductMinimum(produtos[0]), 3);
  assert.equal(summary.estoqueBaixo.length, 2);
  assert.deepEqual(summary.estoqueBaixo.map((item) => item.nomeProduto), ["Notebook Pro", "Mouse"]);
  assert.equal(summary.saldoEstoque, 2);
});

test("Produtos monta inventario, etiquetas e estoque parado", () => {
  const scope = createProductStockScopeViewModel({
    estoqueSaldos,
    filiais: [{ id: "f1", nome: "Filial Centro" }],
    inventoryBranchFilter: "f1",
  });
  const inventory = createProductInventoryListViewModel({
    branchFilteredProducts: [produtos[0]],
    branchScopedStock: scope.branchScopedStock,
    getFilteredProductMinimum: scope.getFilteredProductMinimum,
    getFilteredProductStock: scope.getFilteredProductStock,
    labelPreviewProductId: "p1",
    pedidos: [{ id: "pedido-1", itens: [{ produtoId: "produto-vendido" }] }],
    productPage: 0,
    produtos,
    search: "note",
    selectedInventoryBranchLabel: scope.selectedInventoryBranchLabel,
  });

  assert.equal(inventory.filteredProducts.length, 1);
  assert.equal(inventory.inventoryRows[0].Código, "789");
  assert.equal(inventory.inventoryRows[0]["Estoque mínimo"], "3");
  assert.equal(inventory.labelPreviewProduct.nome, "Notebook Pro");
  assert.equal(inventory.stockLocationRows[0].Filial, "Filial Centro");
  assert.equal(inventory.staleStockProducts[0].nome, "Notebook Pro");
  assert.equal(inventory.staleStockRows[0].Observação, "Sem venda encontrada nos pedidos carregados");
});

test("Produtos monta historico de compras e total da compra atual", () => {
  const summary = createProductPurchaseSummaryViewModel({
    compras: [
      {
        dataCompra: "2026-07-01T10:00:00",
        filial: "Filial Centro",
        fornecedor: "Fornecedor A",
        numeroDocumento: "NF-1",
        status: "RECEBIDA",
        metodoPagamento: "BOLETO",
        valorTotal: 300,
        itens: [
          { quantidade: 2, subtotal: 200 },
          { quantidade: 1, subtotal: 100 },
        ],
      },
    ],
    purchaseItems: [
      { subtotal: 120 },
      { subtotal: 80 },
    ],
    selectedInventoryBranchLabel: "Filial Centro",
  });

  assert.equal(summary.purchaseTotal, 200);
  assert.equal(summary.purchaseHistoryRows.length, 1);
  assert.equal(summary.purchaseHistoryRows[0].Fornecedor, "Fornecedor A");
  assert.equal(summary.purchaseHistoryRows[0].Itens, "2");
  assert.equal(summary.purchaseHistoryRows[0]["Custo médio"], "R$ 100,00");
});
