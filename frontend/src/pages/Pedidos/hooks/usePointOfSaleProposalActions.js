import { endpoints } from "../../../services/resources";
import { downloadCsv } from "../../../utils/exporters";
import { printCommercialProposal } from "../../../utils/salesDocuments";
import {
  buildProposalCsvRows,
  buildQuotePayload,
} from "../services/pointOfSaleProposal";

export function usePointOfSaleProposalActions({
  buildProposal,
  cart,
  deliveryAddress,
  deliveryNote,
  deliveryType,
  discountPayload,
  onSaleCreated,
  paymentInstallments,
  paymentMethod,
  priority,
  proposalBranchLabel,
  proposalNumber,
  proposalRows,
  quoteConditions,
  quoteValidity,
  selectedCliente,
  selectedClienteId,
  session,
  setMessage,
  setSaving,
  total,
}) {
  function handlePrintProposal() {
    if (cart.length === 0) {
      setMessage({ type: "error", text: "Adicione pelo menos um produto para gerar proposta." });
      return;
    }
    printCommercialProposal(buildProposal(), session.empresa || "Nexus One");
  }

  function handleExportProposalCsv() {
    if (cart.length === 0) {
      setMessage({ type: "error", text: "Adicione pelo menos um produto para exportar proposta." });
      return;
    }
    downloadCsv(`nexus-one-proposta-${proposalNumber}.csv`, buildProposalCsvRows({
      proposalBranchLabel,
      proposalNumber,
      proposalRows,
      selectedCliente,
      total,
    }));
  }

  async function handleSaveQuote() {
    if (cart.length === 0) {
      setMessage({ type: "error", text: "Adicione pelo menos um produto para salvar orçamento." });
      return;
    }
    if (!selectedClienteId) {
      setMessage({ type: "error", text: "Selecione um cliente para salvar orçamento." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const pedido = await endpoints.pedidos.criar(buildQuotePayload({
        cart,
        deliveryAddress,
        deliveryNote,
        deliveryType,
        discountPayload,
        paymentInstallments,
        paymentMethod,
        priority,
        quoteConditions,
        quoteValidity,
        selectedClienteId,
        session,
      }));
      setMessage({ type: "success", text: `Orçamento ${pedido.numero || ""} salvo com sucesso.` });
      await onSaleCreated();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return { handleExportProposalCsv, handlePrintProposal, handleSaveQuote };
}
