import { Barcode, Printer } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";
import {
  buildCode128Svg,
  buildQrCodeSvg,
  printProductLabel,
  printProductLabels,
} from "../../../utils/productLabels";
import "./ProductLabelsSection.css";

export function ProductLabelsSection({
  companyName,
  filteredProducts,
  labelPreviewProduct,
  setLabelPreviewProductId,
}) {
  const labelCode = labelPreviewProduct.codigoBarras || labelPreviewProduct.sku || labelPreviewProduct.id || "-";

  return (
    <section className="inventory-tool-card inventory-label-card">
      <div className="panel-title compact">
        <div>
          <h2>Etiquetas de estoque</h2>
          <p>Preview, impressão termica individual e lote dos produtos filtrados.</p>
        </div>
      </div>

      <div className="inventory-label-workbench">
        <label className="form-control">
          <span>Produto para preview</span>
          <select
            value={labelPreviewProduct.id || ""}
            onChange={(event) => setLabelPreviewProductId(event.target.value)}
          >
            {filteredProducts.map((produto) => (
              <option key={produto.id || produto.codigoBarras || produto.nome} value={produto.id}>
                {produto.nome || "Produto sem nome"}
              </option>
            ))}
          </select>
        </label>

        {labelPreviewProduct ? (
          <div className="label-preview-sheet">
            <div className="label-preview-company">{companyName}</div>
            <div className="label-preview-name">{labelPreviewProduct.nome || "Produto sem nome"}</div>
            <div className="label-preview-price">
              {formatCurrency(labelPreviewProduct.precoComDesconto || labelPreviewProduct.precoVenda || 0)}
            </div>
            <div className="label-preview-code-wrap">
              <div>
                <div
                  className="label-preview-barcode"
                  dangerouslySetInnerHTML={{ __html: buildCode128Svg(labelCode) }}
                />
                <span>{labelCode}</span>
              </div>
              <div
                className="label-preview-qr"
                dangerouslySetInnerHTML={{ __html: buildQrCodeSvg(labelCode) }}
              />
            </div>
          </div>
        ) : (
          <div className="empty-selection compact">Nenhum produto filtrado para preview.</div>
        )}

        <div className="label-action-grid">
          <button
            className="report-export"
            disabled={!labelPreviewProduct}
            onClick={() => printProductLabel(labelPreviewProduct, companyName)}
            type="button"
          >
            <Printer size={16} />
            Termica individual
          </button>
          <button
            className="report-export secondary"
            disabled={filteredProducts.length === 0}
            onClick={() => printProductLabels(filteredProducts, companyName)}
            type="button"
          >
            <Barcode size={16} />
            Lote filtrado
          </button>
        </div>
      </div>
    </section>
  );
}
