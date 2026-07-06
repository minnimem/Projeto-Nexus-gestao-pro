import { useRef } from "react";

export function useFinancePanelRefs() {
  return {
    cashDivergenceRef: useRef(null),
    cashFlowRef: useRef(null),
    collectionAgendaRef: useRef(null),
    inconsistencyPanelRef: useRef(null),
    orphanHistoryRef: useRef(null),
    orphanlessRevenueRef: useRef(null),
    orphanOrdersRef: useRef(null),
    salesWithoutFinanceRef: useRef(null),
  };
}

export function useFinanceNavigation({
  cashFlowRef,
  collectionAgendaRef,
  inconsistencyCards,
  inconsistencyPanelRef,
  orphanHistoryFilter,
  setFinanceCategoryFilter,
  setFinanceFilter,
  setFinancePage,
  setOrphanHistoryFilter,
}) {
  function focusInconsistencyCard(cardKey) {
    const card = inconsistencyCards.find((item) => item.key === cardKey);
    if (!card.anchor.current) return;
    if (cardKey === "pedidos-sem-itens-cancelados" && orphanHistoryFilter.preset !== "TODOS") {
      setOrphanHistoryFilter((current) => ({ ...current, preset: "TODOS", inicio: "", fim: "" }));
    }
    window.requestAnimationFrame(() => {
      card.anchor.current.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function focusInconsistencyPanel() {
    inconsistencyPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleReconciliationAction(action) {
    if (action === "sales-without-finance") {
      focusInconsistencyCard("vendas-sem-financeiro");
    } else if (action === "orders-without-items") {
      focusInconsistencyCard("pedidos-sem-itens");
    } else if (action === "cash-difference" || action === "cash") {
      focusInconsistencyCard("caixas-com-divergencia");
    } else if (action === "orphan-revenue") {
      focusInconsistencyCard("receitas-sem-pedido");
    } else {
      focusInconsistencyPanel();
    }
  }

  function scrollToCollectionAgenda() {
    collectionAgendaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleFinancialPlanAction(action) {
    if (action === "cash-flow") {
      cashFlowRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (action === "collection") {
      scrollToCollectionAgenda();
    } else if (action === "inconsistencies") {
      focusInconsistencyPanel();
    } else if (action === "expenses") {
      setFinanceFilter("DESPESAS");
      setFinanceCategoryFilter("");
      setFinancePage(0);
    } else if (action === "payables") {
      setFinanceFilter("VENCIDAS");
      setFinanceCategoryFilter("");
      setFinancePage(0);
    }
  }

  return {
    focusInconsistencyCard,
    focusInconsistencyPanel,
    handleFinancialPlanAction,
    handleReconciliationAction,
    scrollToCollectionAgenda,
  };
}

