import { api } from "../../../services/api.js";

export const productService = {
  listProducts: () => api.get("/produtos"),
  searchProducts: (name) => api.get(`/produtos/buscarnome=${encodeURIComponent(name)}`),
  createProduct: (payload) => api.post("/produtos", payload),
  updateProduct: (id, payload) => api.put(`/produtos/${id}`, payload),
  removeProduct: (id) => api.delete(`/produtos/${id}`),

  adjustStock: (payload) => api.post("/estoque/ajuste", payload),
  createBrand: (payload) => api.post("/marcas", payload),
  createCategory: (payload) => api.post("/categorias", payload),
  createPurchase: (payload) => api.post("/compras", payload),
  createSupplier: (payload) => api.post("/fornecedores", payload),
  sendLowStockNotifications: () => api.post("/notificacoes/estoque-baixo/enviar"),
  stockEntry: (productId, quantity) => api.post(`/estoque/entrada/${productId}quantidade=${quantity}`),
  stockExit: (productId, quantity) => api.post(`/estoque/saida/${productId}quantidade=${quantity}`),
  transferStock: (payload) => api.post("/estoque/transferencia", payload),
};
