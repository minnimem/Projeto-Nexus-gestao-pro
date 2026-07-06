import { initialPurchaseForm } from "../constants/productFormDefaults";
import { productService } from "../services/productService";

export function useProductPurchaseActions({
  onRefresh,
  purchaseForm,
  purchaseItems,
  selectedPurchaseProduct,
  setMessage,
  setPurchaseForm,
  setPurchaseItems,
  setPurchaseSaving,
}) {
  async function handlePurchaseEntry(event) {
    event.preventDefault();
    const itemsToSubmit = purchaseItems.length > 0
      purchaseItems
      : selectedPurchaseProduct && Number(purchaseForm.quantidade) > 0 && Number(purchaseForm.valorTotal) > 0 ?
        [{
            produtoId: selectedPurchaseProduct.id,
            produto: selectedPurchaseProduct.nome,
            quantidade: Number(purchaseForm.quantidade),
            precoUnitario: Number(purchaseForm.valorTotal),
            subtotal: Number(purchaseForm.quantidade) * Number(purchaseForm.valorTotal),
          }]
        : [];

    if (!purchaseForm.fornecedorId || itemsToSubmit.length === 0) {
      setMessage({ type: "error", text: "Selecione fornecedor e adicione ao menos um item válido." });
      return;
    }

    setPurchaseSaving(true);
    setMessage(null);
    try {
      await productService.createPurchase({
        fornecedorId: purchaseForm.fornecedorId,
        metodoPagamento: purchaseForm.metodoPagamento,
        status: purchaseForm.status,
        dataVencimento: purchaseForm.dataVencimento || null,
        numeroDocumento: purchaseForm.numeroDocumento.trim(),
        observacao: purchaseForm.observacao.trim(),
        itens: itemsToSubmit.map((item) => ({
          produtoId: item.produtoId,
          quantidade: Number(item.quantidade),
          precoUnitario: Number(item.precoUnitario),
        })),
      });
      setPurchaseForm(initialPurchaseForm);
      setPurchaseItems([]);
      setMessage({ type: "success", text: "Compra registrada com itens, estoque e financeiro." });
      await onRefresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setPurchaseSaving(false);
    }
  }

  function handleAddPurchaseItem() {
    if (!selectedPurchaseProduct || Number(purchaseForm.quantidade) <= 0 || Number(purchaseForm.valorTotal) <= 0) {
      setMessage({ type: "error", text: "Selecione produto, quantidade e preço unitário maior que zero." });
      return;
    }
    const quantidade = Number(purchaseForm.quantidade);
    const precoUnitario = Number(purchaseForm.valorTotal);
    setPurchaseItems((current) => [...current, {
      produtoId: selectedPurchaseProduct.id,
      produto: selectedPurchaseProduct.nome || "Produto sem nome",
      quantidade,
      precoUnitario,
      subtotal: quantidade * precoUnitario,
    }]);
    setPurchaseForm((current) => ({ ...current, produtoId: "", quantidade: 1, valorTotal: "" }));
    setMessage(null);
  }

  function handleRemovePurchaseItem(index) {
    setPurchaseItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return { handleAddPurchaseItem, handlePurchaseEntry, handleRemovePurchaseItem };
}
