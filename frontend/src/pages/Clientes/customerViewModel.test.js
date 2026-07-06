import assert from "node:assert/strict";
import test from "node:test";

import { createCustomerPageViewModel } from "./viewModels/createCustomerPageViewModel.js";

const clienteVip = {
  id: "c1",
  nome: "Maria Silva",
  cpf: "12345678901",
  email: "maria@nexus.test",
  telefone: "11999990000",
  dataCriacao: new Date().toISOString(),
};

const clienteSemHistorico = {
  id: "c2",
  nome: "Joao Novo",
  cpf: "22222222222",
  email: "",
  telefone: "",
};

const pedidos = [
  {
    id: "p1",
    clienteId: "c1",
    numero: "001",
    data: "2026-07-01T10:00:00",
    status: "FINALIZADA",
    valor: 6000,
    filialId: "f1",
    usuario: "Ana",
    metodoPagamento: "PIX",
    tipoEntrega: "RETIRADA",
    itens: [{ produto: { nomeProduto: "Notebook" }, quantidade: 2, subtotal: 6000 }],
  },
  {
    id: "p2",
    clienteId: "c1",
    numero: "002",
    data: "2026-07-02T10:00:00",
    status: "PENDENTE",
    valor: 400,
    filialId: "f1",
    itens: [],
  },
];

test("Clientes lista, busca e relaciona cliente com pedidos", () => {
  const model = createCustomerPageViewModel({
    customerBranchFilter: "TODAS",
    data: {
      clientes: [clienteVip, clienteSemHistorico],
      pedidos,
      filiais: [{ id: "f1", nome: "Filial Centro" }],
      followUpsComerciais: [{ id: "fu1", pedidoId: "p2", status: "PENDENTE", canal: "WhatsApp" }],
    },
    search: "maria",
    selectedCustomerId: "c1",
  });

  assert.equal(model.clientes.length, 2);
  assert.equal(model.filteredClientes.length, 1);
  assert.equal(model.selectedCustomer.nome, "Maria Silva");
  assert.equal(model.getCustomerBranchLabel(model.selectedCustomer), "Filial Centro");
  assert.equal(model.selectedCustomerOrders.length, 2);
  assert.equal(model.selectedCustomerRevenue, 6000);
  assert.equal(model.selectedCustomerProfile.label, "Inadimplente");
  assert.equal(model.selectedCustomerTags.some((tag) => tag.label === "VIP"), true);
  assert.equal(model.selectedCustomerPendingFollowUps.length, 1);
  assert.equal(model.selectedCustomerFavoriteProducts[0].name, "Notebook");
  assert.equal(model.customerHistoryRows[0].Produtos, "Produtos não carregados");
});

test("Clientes trata cliente sem historico e dados incompletos sem erro visual", () => {
  const model = createCustomerPageViewModel({
    customerBranchFilter: "TODAS",
    data: {
      clientes: [clienteSemHistorico],
      pedidos: [],
      filiais: [],
      followUpsComerciais: [],
    },
    search: "",
    selectedCustomerId: "c2",
  });

  assert.equal(model.selectedCustomerOrders.length, 0);
  assert.equal(model.selectedCustomerProfile.label, "Novo");
  assert.equal(model.selectedCustomerInsights.some((item) => item.title === "Primeira venda"), true);
  assert.equal(model.selectedCustomerInsights.some((item) => item.title === "Contato incompleto"), true);
  assert.equal(model.customerHistoryRows.length, 0);
});
