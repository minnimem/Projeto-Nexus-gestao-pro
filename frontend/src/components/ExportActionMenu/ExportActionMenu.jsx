import { Download, FileText, Printer } from "lucide-react";
import "./ExportActionMenu.css";

export function ExportActionMenu({
  disabled,
  disabledReason = "Nenhum dado disponível para exportar.",
  csvLabel = "CSV",
  pdfLabel = "PDF",
  excelLabel = "Excel",
  jsonLabel = "JSON",
  onCsv,
  onPdf,
  onExcel,
  onJson,
  title = "Exportar",
}) {
  const disabledTitle = disabled ? disabledReason : undefined;

  return (
    <details className={`export-action-menu${disabled ? " disabled" : ""}`}>
      <summary title={disabledTitle}>
        <Download size={15} />
        {title}
      </summary>
      <div className="export-action-menu-options">
        <button disabled={disabled} onClick={onCsv} title={disabledTitle} type="button">
          <Download size={15} />
          {csvLabel}
        </button>
        <button disabled={disabled} onClick={onPdf} title={disabledTitle} type="button">
          <Printer size={15} />
          {pdfLabel}
        </button>
        {onExcel && (
          <button disabled={disabled} onClick={onExcel} title={disabledTitle} type="button">
            <FileText size={15} />
            {excelLabel}
          </button>
        )}
        {onJson && (
          <button disabled={disabled} onClick={onJson} title={disabledTitle} type="button">
            <FileText size={15} />
            {jsonLabel}
          </button>
        )}
      </div>
    </details>
  );
}

export function renderExportActionGroup(props) {
  return <ExportActionMenu {...props} />;
}
