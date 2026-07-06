import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from "../../../utils/formatters.js";

export function buildCompanyOperationsViewModel(empresa, filiais, contratos, configuracoesFiscais) {
  const commercialHistory = Array.isArray(empresa.historicoComercial) ? empresa.historicoComercial : [];
  const commercialHistoryRows = commercialHistory.map((evento) => ({
    Data: evento.dataEvento ? formatDateTime(evento.dataEvento) : "-",
    Usuario: evento.usuarioLogin || "-",
    Perfil: evento.perfil || "-",
    Modulo: evento.modulo || "-",
    Acao: evento.acao || "-",
    Descrição: evento.descricao || "-",
  }));

  const branchRows = filiais.map((filial) => ({
    Nome: filial.nome,
    Código: filial.codigo || "-",
    CNPJ: filial.cnpj || "-",
    Cidade: [filial.cidade, filial.uf].filter(Boolean).join("/") || "-",
    Tipo: filial.matriz ? "Matriz" : "Filial",
    Status: filial.ativo ? "Ativa" : "Inativa",
  }));

  const contractRows = contratos.map((contrato) => ({
    Contrato: contrato.nome,
    Numero: contrato.numero || "-",
    Tipo: contrato.tipo || "-",
    Status: contrato.status || "-",
    Filial: contrato.filial || "Empresa",
    Início: contrato.dataInicio ? formatDate(contrato.dataInicio) : "-",
    Fim: contrato.dataFim ? formatDate(contrato.dataFim) : "-",
    Mensalidade: formatCurrency(contrato.valorMensal || 0),
  }));

  const fiscalConfigRows = configuracoesFiscais.map((config) => ({
    Unidade: config.filialNome || "Empresa / sem filial",
    Modelo: config.modelo || "-",
    Ambiente: config.ambiente || "-",
    Status: config.ativo ? "Ativa" : "Inativa",
    Serie: config.serie || "-",
    ProximoNumero: config.proximoNumero || "-",
    Provedor: config.provedor || "-",
    ProvedorTokenEnv: config.provedorTokenEnv || "-",
    Certificado: config.certificadoAlias || "-",
    CertificadoArquivoEnv: config.certificadoArquivoEnv || "-",
    SenhaEnv: config.certificadoSenhaEnv || "-",
    CertificadoValidoAte: config.certificadoValidoAte ? formatDate(config.certificadoValidoAte) : "-",
    CscEnv: config.cscTokenEnv || "-",
  }));

  const fiscalUnits = [
    {
      id: "EMPRESA",
      nome: empresa.nome || "Empresa",
      tipo: "Empresa",
      cnpj: empresa.cnpj,
      razaoSocial: empresa.razaoSocial || empresa.nome,
      endereco: empresa.endereco,
      cidade: empresa.cidade,
      uf: empresa.uf,
    },
    ...filiais.map((filial) => ({
      id: filial.id,
      nome: filial.nome,
      tipo: filial.matriz ? "Matriz" : "Filial",
      cnpj: filial.cnpj,
      razaoSocial: filial.razaoSocial || filial.nome,
      endereco: filial.endereco,
      cidade: filial.cidade,
      uf: filial.uf,
    })),
  ];

  const fiscalReadinessRows = fiscalUnits.map((unit) => {
    const missing = [
      !String(unit.razaoSocial || "").trim() && "razao social",
      String(unit.cnpj || "").replace(/\D/g, "").length !== 14 && "CNPJ válido",
      !String(unit.endereco || "").trim() && "endereco",
      !String(unit.cidade || "").trim() && "cidade",
      !String(unit.uf || "").trim() && "UF",
    ].filter(Boolean);
    const activeContracts = contratos.filter((contrato) => {
      const sameBranch = unit.id === "EMPRESA"
        ? !contrato.filialId
        : String(contrato.filialId || "") === String(unit.id);
      return sameBranch && String(contrato.status || "").toUpperCase() === "ATIVO";
    }).length;

    return {
      Unidade: unit.nome,
      Tipo: unit.tipo,
      CNPJ: unit.cnpj || "-",
      Cidade: [unit.cidade, unit.uf].filter(Boolean).join("/") || "-",
      Contratos: formatNumber(activeContracts),
      Status: missing.length === 0 ? "Pronta para homologação" : "Pendências cadastrais",
      Pendencias: missing.length === 0 ? "-" : missing.join(", "),
    };
  });

  const fiscalReadyCount = fiscalReadinessRows.filter((row) => row.Status === "Pronta para homologação").length;
  const fiscalPendingCount = fiscalReadinessRows.length - fiscalReadyCount;
  const activeFiscalConfigs = configuracoesFiscais.filter((config) => config.ativo).length;

  return {
    activeFiscalConfigs,
    branchRows,
    commercialHistory,
    commercialHistoryRows,
    contractRows,
    fiscalConfigRows,
    fiscalPendingCount,
    fiscalReadinessRows,
    fiscalReadyCount,
    fiscalUnits,
  };
}
