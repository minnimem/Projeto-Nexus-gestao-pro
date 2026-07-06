import { api } from "../../../services/api.js";

export const customerService = {
  list() {
    return api.get("/clientes");
  },

  create(customer) {
    return api.post("/clientes", customer);
  },

  update(id, customer) {
    return api.put(`/clientes/${id}`, customer);
  },

  remove(id) {
    return api.delete(`/clientes/${id}`);
  },

  createFollowUp(followUp) {
    return api.post("/pedidos/follow-ups", followUp);
  },
};
