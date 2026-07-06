export function ProductCommercialFields({ form, updateForm }) {
  return (
    <>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Compra</span>
          <input min="0.01" step="0.01" type="number" value={form.precoCompra} onChange={(event) => updateForm("precoCompra", event.target.value)} />
        </label>
        <label className="form-control">
          <span>Venda</span>
          <input min="0.01" step="0.01" type="number" value={form.precoVenda} onChange={(event) => updateForm("precoVenda", event.target.value)} />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Estoque mínimo</span>
          <input min="0" type="number" value={form.qtaMinimo} onChange={(event) => updateForm("qtaMinimo", event.target.value)} />
        </label>
        <label className="form-control">
          <span>Estoque máximo</span>
          <input min="0" placeholder="Sem limite" type="number" value={form.qtaMaximo} onChange={(event) => updateForm("qtaMaximo", event.target.value)} />
        </label>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Desconto %</span>
          <input max="100" min="0" step="0.01" type="number" value={form.descontoPercentual} onChange={(event) => updateForm("descontoPercentual", event.target.value)} />
        </label>
        <label className="form-control">
          <span>Garantia mes</span>
          <input min="0" type="number" value={form.garantiaMes} onChange={(event) => updateForm("garantiaMes", event.target.value)} />
        </label>
      </div>

      <label className="form-control">
        <span>Descrição</span>
        <textarea value={form.descricao} onChange={(event) => updateForm("descricao", event.target.value)} placeholder="Detalhes comerciais do produto" />
      </label>
    </>
  );
}
