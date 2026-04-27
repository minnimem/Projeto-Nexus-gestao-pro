import { api } from "./api";

export const endpoints = {
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
    resumo: () => api.get("/logistica"),
    entregas: () => api.get("/estregas"),
    rotas: () => api.get("/rotas-entrega"),
    atualizarStatusRota: (id, status) =>
      api.patch(`/rotas-entrega/${id}/status`, { status }),
  },
  usuarios: {
    listar: () => api.get("/usuarios"),
    admin: () => api.get("/usuarios/admin"),
    criar: (data) => api.post("/usuarios", data),
    atualizar: (id, data) => api.put(`/usuarios/${id}`, data),
    excluir: (id) => api.delete(`/usuarios/${id}`),
  },
};
