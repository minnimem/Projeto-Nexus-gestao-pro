export const SEPARATION_STAGE = {
  ALL: "TODOS",
  WAITING: "AGUARDANDO",
  IN_PROGRESS: "SEPARACAO",
  READY: "SEPARADO",
};

export const SEPARATION_STAGE_OPTIONS = [
  { value: SEPARATION_STAGE.ALL, label: "Todos" },
  { value: SEPARATION_STAGE.WAITING, label: "Aguardando" },
  { value: SEPARATION_STAGE.IN_PROGRESS, label: "Em separação" },
  { value: SEPARATION_STAGE.READY, label: "Prontos" },
];

export const SEPARATION_DELIVERY_OPTIONS = [
  { value: "TODOS", label: "Todas as entregas" },
  { value: "ENTREGA", label: "Entrega" },
  { value: "RETIRADA_LOJA", label: "Retirada" },
];
