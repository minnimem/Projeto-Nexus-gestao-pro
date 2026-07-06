import { X } from "lucide-react";

export function ServiceSignatureModal({
  clearSignatureCanvas,
  handleSubmitDrawnSignature,
  moveSignatureDrawing,
  setSignatureDraft,
  signatureCanvasRef,
  signatureDraft,
  startSignatureDrawing,
  stopSignatureDrawing,
  updateSignatureDraft,
  uploadingAttachment,
}) {
  if (!signatureDraft) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <aside className="panel modal-panel service-signature-modal">
        <div className="panel-title compact">
          <div>
            <span>Assinatura da OS</span>
            <small>{signatureDraft.ordem.numero || signatureDraft.ordem.id} / {signatureDraft.ordem.cliente || "Cliente"}</small>
          </div>
          <button className="modal-close" onClick={() => setSignatureDraft(null)} type="button">
            <X size={16} />
          </button>
        </div>
        <div className="signature-fields">
          <label className="form-control">
            <span>Responsável</span>
            <input value={signatureDraft.nomeResponsavel} onChange={(event) => updateSignatureDraft("nomeResponsavel", event.target.value)} />
          </label>
          <label className="form-control">
            <span>Documento</span>
            <input value={signatureDraft.documentoResponsavel} onChange={(event) => updateSignatureDraft("documentoResponsavel", event.target.value)} />
          </label>
          <label className="form-control">
            <span>Observação</span>
            <input value={signatureDraft.observacao} onChange={(event) => updateSignatureDraft("observacao", event.target.value)} />
          </label>
        </div>
        <canvas
          className="signature-canvas"
          height="220"
          onPointerCancel={stopSignatureDrawing}
          onPointerDown={startSignatureDrawing}
          onPointerLeave={stopSignatureDrawing}
          onPointerMove={moveSignatureDrawing}
          onPointerUp={stopSignatureDrawing}
          ref={signatureCanvasRef}
          width="640"
        />
        <div className="service-flow-actions">
          <button className="mini-action-button" onClick={clearSignatureCanvas} type="button">
            Limpar
          </button>
          <button
            className="checkout-button"
            disabled={!signatureDraft.hasDrawn || uploadingAttachment === `${signatureDraft.ordem.id}-assinatura-canvas`}
            onClick={handleSubmitDrawnSignature}
            type="button"
          >
            {uploadingAttachment === `${signatureDraft.ordem.id}-assinatura-canvas` ? "Enviando..." : "Registrar assinatura"}
          </button>
        </div>
      </aside>
    </div>
  );
}
