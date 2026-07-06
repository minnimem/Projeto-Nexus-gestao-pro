import { useEffect } from "react";
import { endpoints } from "../../../services/resources";

export function useServiceSignatureCanvas({
  onRefresh,
  setMessage,
  setSignatureDraft,
  setUploadingAttachment,
  signatureCanvasRef,
  signatureDraft,
  signatureDrawingRef,
  uploadingAttachment,
}) {
  useEffect(() => {
    if (!signatureDraft) return;
    requestAnimationFrame(() => clearSignatureCanvas());
  }, [signatureDraft.ordem.id]);

  function openSignatureCanvas(ordem) {
    setSignatureDraft({
      ordem,
      nomeResponsavel: ordem.assinaturaClienteNome || ordem.cliente || "",
      documentoResponsavel: ordem.assinaturaClienteDocumento || "",
      observacao: "Assinatura desenhada em tela.",
      hasDrawn: false,
    });
  }

  function updateSignatureDraft(field, value) {
    setSignatureDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function getSignaturePoint(event) {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function clearSignatureCanvas() {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#0f1b33";
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    signatureDrawingRef.current = false;
    setSignatureDraft((prev) => (prev ? { ...prev, hasDrawn: false } : prev));
  }

  function startSignatureDrawing(event) {
    const point = getSignaturePoint(event);
    const canvas = signatureCanvasRef.current;
    if (!point || !canvas) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const context = canvas.getContext("2d");
    signatureDrawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function moveSignatureDrawing(event) {
    if (!signatureDrawingRef.current) return;
    const point = getSignaturePoint(event);
    if (!point) return;
    event.preventDefault();
    const context = signatureCanvasRef.current.getContext("2d");
    context.lineTo(point.x, point.y);
    context.stroke();
    setSignatureDraft((prev) => (prev ? { ...prev, hasDrawn: true } : prev));
  }

  function stopSignatureDrawing(event) {
    if (signatureDrawingRef.current) {
      event.preventDefault();
    }
    signatureDrawingRef.current = false;
  }

  async function handleSubmitDrawnSignature() {
    if (!signatureDraft.ordem || !signatureDraft.hasDrawn || uploadingAttachment) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    setUploadingAttachment(`${signatureDraft.ordem.id}-assinatura-canvas`);
    setMessage(null);

    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Não foi possível gerar a imagem da assinatura.");
      const file = new File([blob], `assinatura-${signatureDraft.ordem.numero || signatureDraft.ordem.id}.png`, { type: "image/png" });
      const response = await endpoints.ordensServico.enviarAssinatura(signatureDraft.ordem.id, file, {
        nomeResponsavel: signatureDraft.nomeResponsavel,
        documentoResponsavel: signatureDraft.documentoResponsavel,
        observacao: signatureDraft.observacao,
      });
      setSignatureDraft(null);
      setMessage({ type: "success", text: `Assinatura desenhada registrada na OS ${response.numero || ""}.` });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingAttachment("");
    }
  }

  return {
    clearSignatureCanvas,
    handleSubmitDrawnSignature,
    moveSignatureDrawing,
    openSignatureCanvas,
    startSignatureDrawing,
    stopSignatureDrawing,
    updateSignatureDraft,
  };
}
