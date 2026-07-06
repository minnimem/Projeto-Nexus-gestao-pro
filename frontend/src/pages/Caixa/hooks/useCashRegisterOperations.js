import { endpoints } from "../../../services/resources.js";
import { asList } from "../../../utils/formatters.js";
import { canInstallmentPayment, getMixedPaymentRows } from "../../../utils/payments.js";
import {
  getCashMovementEndpointName,
  validateCashClosing,
  validateCashMovement,
  validateCashOpening,
  validateCashPaymentReceive,
} from "../services/cashRegisterRules.js";

export function useCashRegisterOperations({
  caixa,
  canOperate,
  closeForm,
  movementForm,
  onRefresh,
  openForm,
  receivePaymentForm,
  selectedCashBranchLabel,
  selectedOrderTotal,
  selectedPendingOrder,
  session,
  setCashAction,
  setCashView,
  setCloseForm,
  setGeneratingCharge,
  setLastCashReceipt,
  setMessage,
  setMovementForm,
  setOpenForm,
  setReceivingOrder,
  setSaving,
  setSelectedCashCharge,
  setSelectedCashReport,
}) {
  async function handleOpenCash(event) {
    event.preventDefault();
    const validation = validateCashOpening(openForm);
    if (validation.error) {
      setMessage({ type: "error", text: validation.error });
      return;
    }

    setSaving("abrir");
    setMessage(null);

    try {
      const caixaAtual = await endpoints.caixas.aberto().catch(() => null);
      if (caixaAtual?.id) {
        await onRefresh();
        setMessage({ type: "success", text: "Caixa já estava aberto. Tela atualizada." });
        return;
      }

      await endpoints.caixas.abrir(validation.payload);
      setOpenForm({ valorInicial: "0", observacao: "" });
      setMessage({ type: "success", text: "Caixa aberto com sucesso." });
      await onRefresh();
    } catch (err) {
      const errorText = err.message || "Não foi possível abrir o caixa.";
      if (/ja possui caixa aberto|já possui caixa aberto/i.test(errorText)) {
        await onRefresh();
        setMessage({ type: "success", text: "Já existe um caixa aberto. Tela atualizada." });
      } else if (/vinculado a uma empresa/i.test(errorText)) {
        setMessage({ type: "error", text: "Não foi possível abrir o caixa: usuário sem empresa vinculada." });
      } else if (/sem permissão|sem permissao|forbidden|403/i.test(errorText)) {
        setMessage({ type: "error", text: "Não foi possível abrir o caixa: perfil sem permissão para operar caixa." });
      } else {
        setMessage({ type: "error", text: `Não foi possível abrir o caixa: ${errorText}` });
      }
    } finally {
      setSaving("");
    }
  }

  async function handleMovement(event) {
    event.preventDefault();
    if (!caixa.id) return;

    const validation = validateCashMovement(movementForm);
    if (validation.error) {
      setMessage({ type: "error", text: validation.error });
      return;
    }

    setSaving(movementForm.tipo);
    setMessage(null);

    try {
      const endpointName = getCashMovementEndpointName(movementForm.tipo);
      await endpoints.caixas[endpointName](caixa.id, validation.payload);

      setMovementForm({
        tipo: "pagamentoRecebido",
        valor: "",
        metodoPagamento: "PIX",
        parcelas: 1,
        descricao: "",
        observacao: "",
      });
      setCashAction("");
      setMessage({ type: "success", text: "Movimento registrado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving("");
    }
  }

  async function handleCloseCash(event) {
    event.preventDefault();
    if (!caixa.id) return;

    const validation = validateCashClosing(closeForm);
    if (validation.error) {
      setMessage({ type: "error", text: validation.error });
      return;
    }

    setSaving("fechar");
    setMessage(null);

    try {
      await endpoints.caixas.fechar(caixa.id, validation.payload);
      setCloseForm({ valorFechamento: "", observacao: "" });
      setCashAction("");
      setMessage({ type: "success", text: "Caixa fechado." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving("");
    }
  }

  async function handleViewCashReport(id) {
    setSaving(`relatorio-${id}`);
    setMessage(null);

    try {
      const report = await endpoints.caixas.resumo(id);
      setSelectedCashReport(report);
      setCashView("movimentos");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving("");
    }
  }

  async function handleReceiveOrder(id) {
    const validation = validateCashPaymentReceive({
      caixa,
      canOperate,
      receivePaymentForm,
      selectedOrderTotal,
      selectedPendingOrder,
    });
    if (validation.error) {
      setMessage({ type: "error", text: validation.error });
      return;
    }

    setReceivingOrder(id);
    setMessage(null);

    try {
      const receivedPedido = await endpoints.pedidos.finalizar(id, validation.payload);
      setLastCashReceipt({
        id: receivedPedido.id || selectedPendingOrder.id || id,
        numero: receivedPedido.numero || selectedPendingOrder.numero,
        cliente: selectedPendingOrder.cliente || "Cliente não informado",
        operador: caixa.usuarioNome || caixa.usuarioLogin || session.nome || session.login || "-",
        filial: selectedPendingOrder.filial || caixa.filial || selectedCashBranchLabel,
        pagamento: receivePaymentForm.metodoPagamento,
        parcelas: canInstallmentPayment(receivePaymentForm.metodoPagamento)
          ? Number(receivePaymentForm.parcelas || 1)
          : 1,
        data: new Date().toLocaleString("pt-BR"),
        itens: asList(selectedPendingOrder.itens),
        total: selectedOrderTotal,
        pagamentosMisturados: validation.isMixedReceive ? getMixedPaymentRows(receivePaymentForm.pagamentos) : [],
      });
      setMessage({ type: "success", text: "Pagamento recebido. Pedido enviado para retirada no estoque." });
      await onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setReceivingOrder("");
    }
  }

  async function handleGeneratePendingOrderCharge(id) {
    setGeneratingCharge(id);
    setMessage(null);

    try {
      const charge = await endpoints.pedidos.gerarCobranca(id, {
        metodoPagamento: receivePaymentForm.metodoPagamento,
        parcelas: canInstallmentPayment(receivePaymentForm.metodoPagamento)
          ? Number(receivePaymentForm.parcelas || 1)
          : 1,
      });
      setSelectedCashCharge(charge);
      setMessage({
        type: "success",
        text: receivePaymentForm.metodoPagamento === "PIX" ? "Pix gerado para este pedido." : "Boleto gerado para este pedido.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setGeneratingCharge("");
    }
  }

  async function copyCashChargeText(text, label) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: "success", text: `${label} copiado.` });
    } catch {
      setMessage({ type: "error", text: "Não foi possível copiar automaticamente." });
    }
  }

  return {
    copyCashChargeText,
    handleCloseCash,
    handleGeneratePendingOrderCharge,
    handleMovement,
    handleOpenCash,
    handleReceiveOrder,
    handleViewCashReport,
  };
}
