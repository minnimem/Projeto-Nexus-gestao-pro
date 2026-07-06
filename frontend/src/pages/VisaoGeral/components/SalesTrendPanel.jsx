import { formatNumber } from "../../../utils/formatters";

export function SalesTrendPanel({ periodLabel, rows, title = "Resumo de vendas", description }) {
  const maxValue = Math.max(...rows.map((row) => row.total), 1);
  const totalSalesCount = rows.reduce((sum, row) => sum + Number(row.count || 0), 0);
  const hasSales = totalSalesCount > 0;
  const width = 720;
  const height = 220;
  const padX = 30;
  const top = 20;
  const bottom = 166;
  const points = rows.map((row, index) => {
    const x = rows.length === 1
      ?
      width / 2
      : padX + (index / (rows.length - 1)) * (width - padX * 2);
    const y = top + (1 - row.total / maxValue) * (bottom - top);
    const labelStep = Math.max(1, Math.ceil(rows.length / 6));
    const hasValue = Number(row.total || 0) > 0;
    const visibleMarker = hasValue || rows.length <= 7;
    const visibleLabel = rows.length <= 7 || index === 0 || index === rows.length - 1 || hasValue || index % labelStep === 0;
    return { ...row, x, y, visibleMarker, visibleLabel };
  });
  const labelPoints = points.filter((point) => point.visibleLabel);
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = points.length > 0 ?
    `M ${points[0].x} ${bottom} L ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${points[points.length - 1].x} ${bottom} Z`
    : "";

  return (
    <article className="panel trend-panel">
      <div className="panel-title compact">
        <div>
          <h2>{title}</h2>
          <p>{description || `${formatNumber(totalSalesCount)} venda(s) no período selecionado.`}</p>
        </div>
        <span>{periodLabel}</span>
      </div>
      <div className="trend-area-chart" aria-label="Resumo de vendas no período">
        {!hasSales && (
          <div className="trend-empty-state">
            <strong>Sem vendas no período</strong>
            <span>O gráfico aparece quando houver venda concluída para este perfil.</span>
          </div>
        )}
        <svg viewBox={`0 0 ${width} ${height}`} role="img">
          {[0, 1, 2, 3].map((line) => (
            <line
              className="trend-grid-line"
              key={line}
              x1="20"
              x2={width - 20}
              y1={top + line * ((bottom - top) / 3)}
              y2={top + line * ((bottom - top) / 3)}
            />
          ))}
          {hasSales && (
            <>
              <path className="trend-area" d={areaPath} />
              <polyline className="trend-line" points={linePoints} />
              {points.filter((point) => point.visibleMarker).map((point) => (
                <g className="trend-point-group" key={point.key}>
                  <circle className="trend-point" cx={point.x} cy={point.y} r="5" />
                  {Number(point.count || 0) > 0 && (
                    <text className="trend-point-count" x={point.x} y={Math.max(12, point.y - 12)}>
                      {formatNumber(point.count)}
                    </text>
                  )}
                </g>
              ))}
            </>
          )}
        </svg>
        <div className="trend-label-row" style={{ gridTemplateColumns: `repeat(${Math.max(labelPoints.length, 1)}, minmax(42px, 1fr))` }}>
          {labelPoints.map((point) => (
            <strong key={point.key}>{point.label}</strong>
          ))}
        </div>
      </div>
    </article>
  );
}
