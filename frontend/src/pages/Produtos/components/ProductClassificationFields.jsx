import { Plus } from "lucide-react";

export function ProductClassificationFields({
  categorias,
  fornecedores,
  form,
  marcas,
  onCreateBrand,
  onCreateCategory,
  onCreateSupplier,
  updateForm,
}) {
  return (
    <>
      <div className="finance-form-row">
        <label className="form-control">
          <span>Categoria</span>
          <select value={form.idCategoria} onChange={(event) => updateForm("idCategoria", event.target.value)}>
            <option value="">Sem categoria</option>
            {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
          </select>
        </label>
        <label className="form-control">
          <span>Marca</span>
          <select value={form.idMarca} onChange={(event) => updateForm("idMarca", event.target.value)}>
            <option value="">Sem marca</option>
            {marcas.map((marca) => <option key={marca.id} value={marca.id}>{marca.nome}</option>)}
          </select>
        </label>
      </div>

      <div className="finance-form-row">
        <div className="form-control">
          <span>Nova categoria</span>
          <button className="panel-action-button secondary" onClick={onCreateCategory} type="button">
            <Plus size={16} />
            Categoria
          </button>
        </div>
        <div className="form-control">
          <span>Nova marca</span>
          <button className="panel-action-button secondary" onClick={onCreateBrand} type="button">
            <Plus size={16} />
            Marca
          </button>
        </div>
      </div>

      <div className="finance-form-row">
        <label className="form-control">
          <span>Fornecedor</span>
          <select value={form.idFornecedor} onChange={(event) => updateForm("idFornecedor", event.target.value)}>
            <option value="">Sem fornecedor</option>
            {fornecedores.map((fornecedor) => <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</option>)}
          </select>
        </label>
        <div className="form-control">
          <span>Cadastro</span>
          <button className="panel-action-button secondary" onClick={onCreateSupplier} type="button">
            <Plus size={16} />
            Fornecedor
          </button>
        </div>
      </div>
    </>
  );
}
