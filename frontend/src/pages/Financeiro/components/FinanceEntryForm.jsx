import { CheckCircle2, Loader2, X } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";

export function FinanceEntryForm({
  filiais,
  financeCategoryOptions,
  form,
  editingFinanceId,
  handleClose,
  handleSubmit,
  message,
  saving,
  setForm,
}) {
  return (
    <aside className="panel side-panel">
      <div className="panel-title compact">
        <div>
          <h2>{editingFinanceId ? "Editar lançamento" : "Novo lançamento"}</h2>
          <p>{editingFinanceId ? "Atualize os dados do lançamento selecionado." : "Entrada manual para ajustes financeiros."}</p>
        </div>
        <button className="modal-close" onClick={handleClose} title="Fechar" type="button">
          <X size={17} />
        </button>
      </div>

      <form className="finance-form" onSubmit={handleSubmit}>
        <label className="form-control">
          <span>Descrição</span>
          <input
            value={form.descricao}
            onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
            placeholder="Ex.: Receita balcão"
          />
        </label>

        <div className="finance-form-row">
          <label className="form-control">
            <span>Tipo</span>
            <select value={form.tipo} onChange={(event) => setForm((prev) => ({ ...prev, tipo: event.target.value }))}>
              <option value="RECEITA">Receita</option>
              <option value="DESPESA">Despesa</option>
            </select>
          </label>
          <label className="form-control">
            <span>Status</span>
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="APROVADO">Aprovado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="RECUSADO">Recusado</option>
            </select>
          </label>
        </div>

        <label className="form-control">
          <span>Categoria</span>
          <select value={form.categoria} onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}>
            {financeCategoryOptions.map((categoria) => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </label>

        <div className="finance-form-row">
          <label className="form-control">
            <span>Valor</span>
            <input
              min="0.01"
              step="0.01"
              type="number"
              value={form.valor}
              onChange={(event) => setForm((prev) => ({ ...prev, valor: event.target.value }))}
              placeholder="0,00"
            />
          </label>
          <label className="form-control">
            <span>Pagamento</span>
            <select value={form.metodoPagamento} onChange={(event) => setForm((prev) => ({ ...prev, metodoPagamento: event.target.value }))}>
              <option value="PIX">Pix</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CARTAO_CREDITO">Cartao credito</option>
              <option value="CARTAO_DEBITO">Cartao debito</option>
              <option value="BOLETO">Boleto</option>
              <option value="MISTO">Misto</option>
            </select>
          </label>
        </div>

        <label className="form-control">
          <span>Vencimento</span>
          <input
            type="date"
            value={form.dataVencimento}
            onChange={(event) => setForm((prev) => ({ ...prev, dataVencimento: event.target.value }))}
          />
        </label>

        <label className="form-control">
          <span>Filial</span>
          <select value={form.filialId} onChange={(event) => setForm((prev) => ({ ...prev, filialId: event.target.value }))}>
            <option value="">Empresa / usuário atual</option>
            {filiais.map((filial) => (
              <option key={filial.id} value={filial.id}>
                {filial.matriz ? "Matriz" : "Filial"} - {filial.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="finance-form-row">
          <label className="form-control">
            <span>Modo</span>
            <select value={form.modoLancamento} onChange={(event) => setForm((prev) => ({ ...prev, modoLancamento: event.target.value }))}>
              <option value="UNICO">Unico</option>
              <option value="PARCELADO">Parcelado</option>
              <option value="RECORRENTE">Recorrente</option>
            </select>
          </label>
          <label className="form-control">
            <span>{form.modoLancamento === "RECORRENTE" ? "Recorrências" : "Parcelas"}</span>
            <input
              disabled={form.modoLancamento === "UNICO"}
              min="1"
              max="60"
              type="number"
              value={form.parcelas}
              onChange={(event) => setForm((prev) => ({ ...prev, parcelas: event.target.value }))}
            />
          </label>
        </div>

        {form.modoLancamento !== "UNICO" && (
          <div className="finance-form-row">
            <label className="form-control">
              <span>Intervalo</span>
              <input
                min="1"
                max="12"
                type="number"
                value={form.intervaloMeses}
                onChange={(event) => setForm((prev) => ({ ...prev, intervaloMeses: event.target.value }))}
              />
            </label>
            <div className="form-control">
              <span>Previsão</span>
              <strong className="stock-current">
                {form.modoLancamento === "PARCELADO" ?
                  `${formatCurrency(Number(form.valor || 0) / Math.max(1, Number(form.parcelas || 1)))} por parcela`
                  : `${formatCurrency(form.valor)} por recorrência`}
              </strong>
            </div>
          </div>
        )}

        <label className="form-control">
          <span>Observação</span>
          <textarea
            value={form.observacao}
            onChange={(event) => setForm((prev) => ({ ...prev, observacao: event.target.value }))}
            placeholder="Detalhes internos"
          />
        </label>

        {message && <p className={`form-message ${message.type}`}>{message.text}</p>}

        <button className="checkout-button" disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={17} /> : <CheckCircle2 size={17} />}
          {saving ? "Salvando..." : editingFinanceId ? "Atualizar lançamento" : "Salvar lançamento"}
        </button>
      </form>
    </aside>
  );
}
