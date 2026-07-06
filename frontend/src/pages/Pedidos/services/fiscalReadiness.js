export function getFiscalReadinessData({ fiscalControlOrders, getLatestFiscalDocument }) {
  function getFiscalRealConclusion(pedido) {
    const documento = getLatestFiscalDocument(pedido);
    if (!documento.id) {
      return {
        status: "SEM_DOCUMENTO",
        label: "Aguardando homologação",
        tone: "pendente",
        ready: false,
        next: "Preparar documento fiscal.",
      };
    }
    if (documento.possuiPendenciasFiscais) {
      return {
        status: "PENDENCIAS",
        label: "Corrigir cadastro",
        tone: "pendente",
        ready: false,
        next: "Baixar pendências e revalidar.",
      };
    }
    if (!documento.possuiPayloadJson || !documento.possuiXmlEnvio) {
      return {
        status: "PACOTE_INCOMPLETO",
        label: "Gerar pacote base",
        tone: "em_andamento",
        ready: false,
        next: "Gerar XML e payload fiscal.",
      };
    }
    if (!["AUTORIZADO", "CONTINGENCIA", "CANCELADO"].includes(String(documento.status || ""))) {
      return {
        status: "HOMOLOGAR",
        label: "Concluir homologação",
        tone: "em_andamento",
        ready: false,
        next: "Validar XML e transmitir/autorizar.",
      };
    }
    return {
      status: "PACOTE_REAL",
      label: "Pacote real pronto",
      tone: "receita",
      ready: true,
      next: "Baixar pacote, manifesto e validar integridade.",
    };
  }

  const fiscalRealConclusion = fiscalControlOrders.map((pedido) => ({
    pedido,
    ...getFiscalRealConclusion(pedido),
  }));
  const fiscalRealConclusionSummary = [
    {
      label: "Pacote real",
      value: fiscalRealConclusion.filter((item) => item.ready).length,
      detail: "Prontos para conferência técnica",
      tone: "success",
    },
    {
      label: "Pendências",
      value: fiscalRealConclusion.filter((item) => item.status === "PENDENCIAS").length,
      detail: "Cadastro fiscal bloqueando emissão",
      tone: "warning",
    },
    {
      label: "Homologar",
      value: fiscalRealConclusion.filter((item) => ["SEM_DOCUMENTO", "PACOTE_INCOMPLETO", "HOMOLOGAR"].includes(item.status)).length,
      detail: "Faltam etapas de homologação",
      tone: "info",
    },
  ];

  return {
    fiscalNextConclusion: fiscalRealConclusion.find((item) => !item.ready),
    fiscalRealConclusion,
    fiscalRealConclusionSummary,
    getFiscalRealConclusion,
  };
}
