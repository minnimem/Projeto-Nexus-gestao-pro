import { api } from "./api";

export const endpoints = {
  auth: {
    recuperarSenha: (login) => api.post("/auth/recuperar", { login }),
    resetarSenha: (token, novaSenha) => api.post("/auth/resetar", { token, novaSenha }),
  },
  auditoria: {
    listar: () => api.get("/auditoria"),
  },
  empresa: {
    minha: () => api.get("/empresa/minha"),
    atualizarMinha: (data) => api.put("/empresa/minha", data),
    filiais: () => api.get("/empresa/filiais"),
    criarFilial: (data) => api.post("/empresa/filiais", data),
    atualizarFilial: (id, data) => api.put(`/empresa/filiais/${id}`, data),
    contratos: () => api.get("/empresa/contratos"),
    criarContrato: (data) => api.post("/empresa/contratos", data),
    atualizarContrato: (id, data) => api.put(`/empresa/contratos/${id}`, data),
  },
  dashboard: {
    pedidos: () => api.get("/pedidos/dashboard"),
    pedidosPorUsuario: (usuarioId) =>
      api.get(`/pedidos/dashboard/usuario/${usuarioId}`),
  },
  clientes: {
    listar: () => api.get("/clientes"),
    criar: (data) => api.post("/clientes", data),
    atualizar: (id, data) => api.put(`/clientes/${id}`, data),
    excluir: (id) => api.delete(`/clientes/${id}`),
  },
  produtos: {
    listar: () => api.get("/produtos"),
    buscar: (nome) => api.get(`/produtos/buscar?nome=${encodeURIComponent(nome)}`),
    criar: (data) => api.post("/produtos", data),
    atualizar: (id, data) => api.put(`/produtos/${id}`, data),
    excluir: (id) => api.delete(`/produtos/${id}`),
  },
  fornecedores: {
    listar: () => api.get("/fornecedores"),
    criar: (data) => api.post("/fornecedores", data),
    atualizar: (id, data) => api.put(`/fornecedores/${id}`, data),
    excluir: (id) => api.delete(`/fornecedores/${id}`),
  },
  categorias: {
    listar: (tipo) => api.get(tipo ? `/categorias?tipo=${encodeURIComponent(tipo)}` : "/categorias"),
    criar: (data) => api.post("/categorias", data),
    atualizar: (id, data) => api.put(`/categorias/${id}`, data),
    excluir: (id) => api.delete(`/categorias/${id}`),
  },
  marcas: {
    listar: () => api.get("/marcas"),
    criar: (data) => api.post("/marcas", data),
    atualizar: (id, data) => api.put(`/marcas/${id}`, data),
    excluir: (id) => api.delete(`/marcas/${id}`),
  },
  compras: {
    listar: () => api.get("/compras"),
    criar: (data) => api.post("/compras", data),
  },
  comissoes: {
    config: () => api.get("/comissoes/config"),
    atualizarConfig: (data) => api.put("/comissoes/config", data),
  },
  estoque: {
    baixo: () => api.get("/estoque/baixo"),
    saldos: () => api.get("/estoque/saldos"),
    entrada: (produtoId, quantidade) =>
      api.post(`/estoque/entrada/${produtoId}?quantidade=${quantidade}`),
    saida: (produtoId, quantidade) =>
      api.post(`/estoque/saida/${produtoId}?quantidade=${quantidade}`),
    compra: (data) => api.post("/estoque/compra", data),
    ajuste: (data) => api.post("/estoque/ajuste", data),
    transferencia: (data) => api.post("/estoque/transferencia", data),
  },
  pedidos: {
    listar: () => api.get("/pedidos"),
    obter: (id) => api.get(`/pedidos/${id}`),
    itens: (id) => api.get(`/pedidos/${id}/itens`),
    criar: (data) => api.post("/pedidos", data),
    atualizar: (id, data) => api.put(`/pedidos/${id}`, data),
    finalizar: (id, data) => api.patch(`/pedidos/${id}/finalizar`, data),
    gerarCobranca: (id, data) => api.patch(`/pedidos/${id}/gerar-cobranca`, data),
    converterOrcamento: (id) => api.patch(`/pedidos/${id}/converter-orcamento`),
    iniciarSeparacao: (id) => api.patch(`/pedidos/${id}/iniciar-separacao`),
    concluirSeparacao: (id) => api.patch(`/pedidos/${id}/concluir-separacao`),
    cancelarInconsistente: (id) => api.patch(`/pedidos/${id}/cancelar-inconsistente`),
    cancelarInconsistentes: (ids) => api.patch("/pedidos/cancelar-inconsistentes", { ids }),
    followUps: () => api.get("/pedidos/follow-ups"),
    criarFollowUp: (data) => api.post("/pedidos/follow-ups", data),
    concluirFollowUp: (id) => api.patch(`/pedidos/follow-ups/${id}/concluir`),
    cancelarFollowUp: (id) => api.patch(`/pedidos/follow-ups/${id}/cancelar`),
    excluir: (id) => api.delete(`/pedidos/${id}`),
  },
  financeiro: {
    listar: () => api.get("/financeiro"),
    resumo: () => api.get("/financeiro/resumo"),
    criar: (data) => api.post("/financeiro", data),
    atualizar: (id, data) => api.put(`/financeiro/${id}`, data),
    cancelar: (id) => api.patch(`/financeiro/${id}/cancelar`),
    baixar: (id) => api.patch(`/financeiro/${id}/baixar`),
    gerarCobranca: (id) => api.patch(`/financeiro/${id}/gerar-cobranca`),
    estornar: (id) => api.patch(`/financeiro/${id}/estornar`),
    followUps: () => api.get("/financeiro/follow-ups"),
    criarFollowUp: (data) => api.post("/financeiro/follow-ups", data),
    concluirFollowUp: (id) => api.patch(`/financeiro/follow-ups/${id}/concluir`),
    cancelarFollowUp: (id) => api.patch(`/financeiro/follow-ups/${id}/cancelar`),
    recorrencias: () => api.get("/financeiro/recorrencias"),
    criarRecorrencia: (data) => api.post("/financeiro/recorrencias", data),
    alterarRecorrenciaStatus: (id, ativo) =>
      api.patch(`/financeiro/recorrencias/${id}/status?ativo=${encodeURIComponent(ativo)}`),
    gerarRecorrencia: (id, quantidade = 1) =>
      api.post(`/financeiro/recorrencias/${id}/gerar?quantidade=${encodeURIComponent(quantidade)}`),
  },
  caixas: {
    aberto: () => api.get("/caixas/aberto"),
    listar: () => api.get("/caixas"),
    resumo: (id) => api.get(`/caixas/${id}/resumo`),
    abrir: (data) => api.post("/caixas/abrir", data),
    suprimento: (id, data) => api.post(`/caixas/${id}/suprimento`, data),
    pagamentoRecebido: (id, data) => api.post(`/caixas/${id}/pagamento-recebido`, data),
    sangria: (id, data) => api.post(`/caixas/${id}/sangria`, data),
    fechar: (id, data) => api.post(`/caixas/${id}/fechar`, data),
  },
  logistica: {
    resumo: () => api.get("/logistica?size=50"),
    entregas: () => api.get("/estregas"),
    transportadoras: () => api.get("/transportadoras"),
    criarTransportadora: (data) => api.post("/transportadoras", data),
    atualizarTransportadora: (id, data) => api.put(`/transportadoras/${id}`, data),
    excluirTransportadora: (id) => api.delete(`/transportadoras/${id}`),
    rotas: () => api.get("/rotas-entrega"),
    veiculos: () => api.get("/veiculos"),
    veiculosAtivos: () => api.get("/veiculos/ativos"),
    criarVeiculo: (data) => api.post("/veiculos", data),
    entregadores: () => api.get("/entregadores"),
    entregadoresAtivos: () => api.get("/entregadores/ativos"),
    criarEntregador: (data) => api.post("/entregadores", data),
    criarRota: (data) => api.post("/rotas-entrega", data),
    atualizarRota: (id, data) => api.put(`/rotas-entrega/${id}`, data),
    atualizarStatusRota: (id, status) =>
      api.patch(`/rotas-entrega/${id}/status`, { status }),
    vincularEntregasRota: (rotaId, entregaIds) =>
      api.patch(`/rotas-entrega/${rotaId}/entregas`, { entregaIds }),
    vincularEntregadorRota: (rotaId, entregadorId) =>
      api.patch(`/rotas-entrega/${rotaId}/entregador/${entregadorId}`),
    vincularVeiculoRota: (rotaId, veiculoId) =>
      api.patch(`/rotas-entrega/${rotaId}/veiculo/${veiculoId}`),
  },
  notificacoes: {
    enviarFollowUps: () => api.post("/notificacoes/follow-ups/enviar"),
    enviarEstoqueBaixo: () => api.post("/notificacoes/estoque-baixo/enviar"),
  },
  usuarios: {
    listar: () => api.get("/usuarios"),
    admin: () => api.get("/usuarios/admin"),
    criar: (data) => api.post("/usuarios", data),
    atualizar: (id, data) => api.put(`/usuarios/${id}`, data),
    alterarPerfil: (id, perfil) =>
      api.put(`/usuarios/${id}/perfil?novoPerfil=${encodeURIComponent(perfil)}`),
    alterarAcesso: (id, ativo) =>
      api.patch(`/usuarios/${id}/acesso?ativo=${encodeURIComponent(ativo)}`),
    alterarPermissoes: (id, data) =>
      api.patch(`/usuarios/${id}/permissoes`, data),
    excluir: (id) => api.delete(`/usuarios/${id}`),
  },
};
