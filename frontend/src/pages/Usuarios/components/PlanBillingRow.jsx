import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { PlanBillingActions } from "./PlanBillingActions";
import { PlanBillingDueCell } from "./PlanBillingDueCell";

export function PlanBillingRow({
  copyPlanBillingMessage,
  handlePlanBillingStatusChange,
  item,
  planBillingNotes,
  savePlanBillingNote,
  savingBillingCompanyId,
  selectedPlanBillingIds,
  togglePlanBillingSelection,
  updatePlanBillingNote,
}) {
  const note = planBillingNotes[item.id] || "";
  const savingThisCompany = String(savingBillingCompanyId || "") === String(item.id || "");
  const selectedThisCompany = selectedPlanBillingIds.includes(String(item.id || ""));

  return (
    <tr>
      <td>
        <input
          checked={selectedThisCompany}
          onChange={() => togglePlanBillingSelection(item.id)}
          type="checkbox"
        />
      </td>
      <td>
        <strong>{item.nome || item.razaoSocial || "Empresa"}</strong>
        <small>{item.email || item.cnpj || "Sem contato financeiro"}</small>
      </td>
      <td>
        <span className="pill info">{item.plano}</span>
      </td>
      <td>
        <StatusBadge status={item.billingStatus.status} label={item.billingStatus.label} />
        <small>{item.ativo === false ? "Empresa inativa" : item.statusAssinaturaNormalizado}</small>
      </td>
      <td>
        <strong>{formatCurrency(item.valorMensal)}</strong>
        <small>{formatNumber(item.usuariosAtivos || 0)} usuário(s)</small>
      </td>
      <td>
        <PlanBillingDueCell item={item} />
      </td>
      <td>
        <label className="form-control compact">
          <span>Observação</span>
          <input
            disabled={savingThisCompany}
            onChange={(event) => updatePlanBillingNote(item.id, event.target.value)}
            placeholder="Contato, promessa, comprovante..."
            value={note}
          />
        </label>
        <PlanBillingActions
          copyPlanBillingMessage={copyPlanBillingMessage}
          handlePlanBillingStatusChange={handlePlanBillingStatusChange}
          item={item}
          note={note}
          savePlanBillingNote={savePlanBillingNote}
          savingThisCompany={savingThisCompany}
        />
      </td>
    </tr>
  );
}
