export const EMPTY_MESSAGES = {
  default: "Nenhum registro encontrado.",
  customers: "Nenhum cliente encontrado.",
  orders: "Nenhum pedido encontrado.",
};

export function errorMessage(text, fallback = "Não foi possível concluir a operação.") {
  return {
    type: "error",
    text: text || fallback,
  };
}

export function successMessage(text) {
  return {
    type: "success",
    text,
  };
}

export function getErrorText(error, fallback = "Não foi possível concluir a operação.") {
  return error?.message || fallback;
}
