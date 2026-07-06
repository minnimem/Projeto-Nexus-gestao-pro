export function PointOfSalePrioritySelect({ priority, setPriority }) {
  return (
    <label className="form-control">
      <span>Prioridade</span>
      <select value={priority} onChange={(event) => setPriority(event.target.value)}>
        <option value="Normal">Normal</option>
        <option value="Alta">Alta</option>
        <option value="Urgente">Urgente</option>
        <option value="Baixa">Baixa</option>
      </select>
    </label>
  );
}
