import { formatNumber } from "../../../utils/formatters";

export function FiscalRealConclusionSummary({
  fiscalNextConclusion,
  fiscalRealConclusionSummary,
}) {
  return (
    <div className="fiscal-real-conclusion">
      <div>
        <span>Conclusão fiscal real</span>
        <strong>{fiscalNextConclusion ? fiscalNextConclusion.next : "Fila pronta para conferência final."}</strong>
        <small>Checklist, pacote JSON, manifesto e integridade ficam disponíveis após o documento fiscal existir.</small>
      </div>
      {fiscalRealConclusionSummary.map((item) => (
        <article className={`fiscal-real-card ${item.tone}`} key={item.label}>
          <span>{item.label}</span>
          <strong>{formatNumber(item.value)}</strong>
          <small>{item.detail}</small>
        </article>
      ))}
    </div>
  );
}
