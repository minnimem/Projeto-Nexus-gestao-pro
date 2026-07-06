import { ArrowUpRight, Copy, X } from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/formatters";

export function FinanceChargePanel({ copyChargeText, handleClose, selectedCharge }) {
  return (
    <aside className="panel side-panel">
      <div className="panel-title compact">
        <div>
          <h2>Cobrança</h2>
          <p>{selectedCharge.descricao || "Lançamento financeiro"}</p>
        </div>
        <button className="modal-close" onClick={handleClose} title="Fechar" type="button">
          <X size={17} />
        </button>
      </div>

      <div className="charge-summary">
        <div>
          <span>Código</span>
          <strong>{selectedCharge.codigoCobranca || "-"}</strong>
        </div>
        <div>
          <span>Valor</span>
          <strong>{formatCurrency(selectedCharge.valor)}</strong>
        </div>
        <div>
          <span>Vencimento</span>
          <strong>{selectedCharge.dataVencimento ? formatDate(selectedCharge.dataVencimento) : "-"}</strong>
        </div>
        <div>
          <span>Provedor</span>
          <strong>{selectedCharge.cobrancaProvedor || "DEMO"}</strong>
        </div>
      </div>
      {selectedCharge.cobrancaUrl && (
        <a className="charge-link" href={selectedCharge.cobrancaUrl} rel="noreferrer" target="_blank">
          <ArrowUpRight size={16} />
          Abrir cobrança
        </a>
      )}

      {selectedCharge.pixCopiaCola && (
        <div className="charge-box">
          {selectedCharge.pixQrCodeUrl && (
            <img alt="QR Code Pix" className="charge-qr" src={selectedCharge.pixQrCodeUrl} />
          )}
          <label className="form-control">
            <span>Pix copia e cola</span>
            <textarea readOnly value={selectedCharge.pixCopiaCola} />
          </label>
          <button
            className="checkout-button"
            onClick={() => copyChargeText(selectedCharge.pixCopiaCola, "Pix copia e cola")}
            type="button"
          >
            <Copy size={17} />
            Copiar Pix
          </button>
        </div>
      )}

      {selectedCharge.boletoLinhaDigitavel && (
        <div className="charge-box">
          <label className="form-control">
            <span>Linha digitavel</span>
            <textarea readOnly value={selectedCharge.boletoLinhaDigitavel} />
          </label>
          <div className="charge-summary compact">
            <div>
              <span>Documento</span>
              <strong>{selectedCharge.boletoNumeroDocumento || "-"}</strong>
            </div>
            <div>
              <span>Nosso numero</span>
              <strong>{selectedCharge.boletoNossoNumero || "-"}</strong>
            </div>
          </div>
          <button
            className="checkout-button"
            onClick={() => copyChargeText(selectedCharge.boletoLinhaDigitavel, "Linha digitavel")}
            type="button"
          >
            <Copy size={17} />
            Copiar boleto
          </button>
        </div>
      )}
    </aside>
  );
}

