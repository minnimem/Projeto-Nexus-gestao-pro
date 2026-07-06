import { formatDate, formatNumber } from "../../../utils/formatters";

export function ServiceOrderSummaryStep({ form, formChecklistItems }) {
  return (
    <div className="service-order-summary">
      <span>Resumo da OS</span>
      <strong>{form.titulo || "Título pendente"}</strong>
      <small>{form.clienteId ? "Cliente selecionado" : "Cliente pendente"} / {form.tecnicoId ? "Técnico definido" : "Sem técnico"}</small>
      <small>Prioridade {form.prioridade} / prazo {form.prazo ? formatDate(form.prazo) : "sem prazo"} / {formatNumber(formChecklistItems.length)} item(ns)</small>
      <small>{form.tipoServico} / garantia {form.garantiaCoberta === "SIM" ? "sim" : "não"} / recorrência {form.recorrente === "SIM" ? `${form.recorrenciaIntervaloMeses || 1} mês(es)` : "não"}</small>
      <small>{form.pecasUtilizadas ? `Peças: ${form.pecasUtilizadas}` : "Sem peças informadas"} / assinatura {form.assinaturaCliente === "SIM" ? (form.assinaturaClienteNome || "coletada") : "pendente"}</small>
    </div>
  );
}
