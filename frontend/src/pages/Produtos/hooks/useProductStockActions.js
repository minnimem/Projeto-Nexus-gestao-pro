import { formatNumber } from "../../../utils/formatters";
import { initialInventoryCountForm, initialStockTransferForm } from "../constants/productFormDefaults";
import { productService } from "../services/productService";

export function useProductStockActions({
  adjustment,
  inventoryCountForm,
  inventoryDifference,
  onRefresh,
  setInventoryCountForm,
  setInventorySaving,
  setMessage,
  setSaving,
  setStockProductSearch,
  setStockTransferForm,
  setStockTransferSaving,
  stockTransferForm,
}) {
  async function handleSendStockNotifications() {
    setSaving(true);
    setMessage(null);
    try {
      const result = await productService.sendLowStockNotifications();
      if (!result.ativo) {
        setMessage({ type: "error", text: "Notificações externas estão desativadas ou sem webhook configurado." });
      } else if (Number(result.itensEnviados || 0) === 0) {
        setMessage({ type: "success", text: "Nenhum item em estoque baixo aguardava notificação." });
      } else {
        setMessage({ type: "success", text: `${formatNumber(result.itensEnviados)} item(ns) de estoque baixo enviados ao webhook.` });
      }
      await onRefresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Não foi possível enviar alerta de estoque baixo." });
    } finally {
      setSaving(false);
    }
  }

  async function handleInventoryCount(event) {
    event.preventDefault();
    if (!inventoryCountForm.produtoId || inventoryCountForm.quantidadeContada === "") {
      setMessage({ type: "error", text: "Selecione o produto e informe a contagem física." });
      return;
    }
    if (Number(inventoryCountForm.quantidadeContada) < 0) {
      setMessage({ type: "error", text: "Contagem física não pode ser negativa." });
      return;
    }

    setInventorySaving(true);
    setMessage(null);
    try {
      await productService.adjustStock({
        produtoId: inventoryCountForm.produtoId,
        quantidadeContada: Number(inventoryCountForm.quantidadeContada),
        observacao: inventoryCountForm.observacao.trim(),
      });
      setInventoryCountForm(initialInventoryCountForm);
      setMessage({
        type: "success",
        text: inventoryDifference === 0 ?
          "Inventario registrado sem divergencia."
          : `Inventario ajustado em ${formatNumber(Math.abs(inventoryDifference))} unidade(s).`,
      });
      await onRefresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setInventorySaving(false);
    }
  }

  async function handleStockTransfer(event) {
    event.preventDefault();
    const origem = (stockTransferForm.origem || "GERAL").trim();
    const destino = stockTransferForm.destino.trim();
    const quantidade = Number(stockTransferForm.quantidade);
    if (!stockTransferForm.produtoId || !destino || quantidade <= 0) {
      setMessage({ type: "error", text: "Selecione o produto, informe destino e quantidade válida." });
      return;
    }
    if (origem.toUpperCase() === destino.toUpperCase()) {
      setMessage({ type: "error", text: "Origem e destino devem ser diferentes." });
      return;
    }

    setStockTransferSaving(true);
    setMessage(null);
    try {
      await productService.transferStock({
        produtoId: stockTransferForm.produtoId,
        origem,
        destino,
        quantidade,
        observacao: stockTransferForm.observacao.trim(),
      });
      setStockTransferForm(initialStockTransferForm);
      setMessage({ type: "success", text: "Transferéncia registrada com sucesso." });
      await onRefresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setStockTransferSaving(false);
    }
  }

  async function handleAdjustment(event) {
    event.preventDefault();
    if (!adjustment.produtoId || Number(adjustment.quantidade) <= 0) {
      setMessage({ type: "error", text: "Selecione um produto e informe uma quantidade válida." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      if (adjustment.type === "entrada") {
        await productService.stockEntry(adjustment.produtoId, adjustment.quantidade);
      } else {
        await productService.stockExit(adjustment.produtoId, adjustment.quantidade);
      }
      setMessage({ type: "success", text: "Estoque atualizado com sucesso." });
      setStockProductSearch("");
      await onRefresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return { handleAdjustment, handleInventoryCount, handleSendStockNotifications, handleStockTransfer };
}
