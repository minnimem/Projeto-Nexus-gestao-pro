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
  estoque: {
    baixo: () => api.get("/estoque/baixo"),
    entrada: (produtoId, quantidade) =>
      api.post(`/estoque/entrada/${produtoId}?quantidade=${quantidade}`),
    saida: (produtoId, quantidade) =>
      api.post(`/estoque/saida/${produtoId}?quantidade=${quantidade}`),
  },
  pedidos: {
    listar: () => api.get("/pedidos"),
    obter: (id) => api.get(`/pedidos/${id}`),
    criar: (data) => api.post("/pedidos", data),
    atualizar: (id, data) => api.put(`/pedidos/${id}`, data),
    finalizar: (id) => api.patch(`/pedidos/${id}/finalizar`),
    excluir: (id) => api.delete(`/pedidos/${id}`),
  },
  financeiro: {
    listar: () => api.get("/financeiro"),
    resumo: () => api.get("/financeiro/resumo"),
    criar: (data) => api.post("/financeiro", data),
    atualizar: (id, data) => api.put(`/financeiro/${id}`, data),
    cancelar: (id) => api.patch(`/financeiro/${id}/cancelar`),
    estornar: (id) => api.patch(`/financeiro/${id}/estornar`),
  },
  logistica: {
    resumo: () => api.get("/logistica?size=50"),
    entregas: () => api.get("/estregas"),
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
    vincularEntregadorRota: (rotaId, entregadorId) =>
      api.patch(`/rotas-entrega/${rotaId}/entregador/${entregadorId}`),
    vincularVeiculoRota: (rotaId, veiculoId) =>
      api.patch(`/rotas-entrega/${rotaId}/veiculo/${veiculoId}`),
  },
  usuarios: {
    listar: () => api.get("/usuarios"),
    admin: () => api.get("/usuarios/admin"),
    criar: (data) => api.post("/usuarios", data),
    atualizar: (id, data) => api.put(`/usuarios/${id}`, data),
    alterarPerfil: (id, perfil) =>
      api.put(`/usuarios/${id}/perfil?novoPerfil=${encodeURIComponent(perfil)}`),
    excluir: (id) => api.delete(`/usuarios/${id}`),
  },
};
