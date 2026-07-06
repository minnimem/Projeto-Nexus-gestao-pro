export function buildFiscalConfigPayload(fiscalConfigForm, empresaId) {
  return {
    ...fiscalConfigForm,
    empresaId,
    filialId: fiscalConfigForm.filialId || null,
    proximoNumero: fiscalConfigForm.proximoNumero ? Number(fiscalConfigForm.proximoNumero) : null,
    serie: fiscalConfigForm.serie.trim() || null,
    provedor: fiscalConfigForm.provedor.trim() || null,
    provedorTokenEnv: fiscalConfigForm.provedorTokenEnv.trim() || null,
    certificadoAlias: fiscalConfigForm.certificadoAlias.trim() || null,
    certificadoArquivoEnv: fiscalConfigForm.certificadoArquivoEnv.trim() || null,
    certificadoSenhaEnv: fiscalConfigForm.certificadoSenhaEnv.trim() || null,
    certificadoValidoAte: fiscalConfigForm.certificadoValidoAte || null,
    cscId: fiscalConfigForm.cscId.trim() || null,
    cscTokenEnv: fiscalConfigForm.cscTokenEnv.trim() || null,
    endpointHomologacao: fiscalConfigForm.endpointHomologacao.trim() || null,
    endpointProducao: fiscalConfigForm.endpointProducao.trim() || null,
    observacao: fiscalConfigForm.observacao.trim() || null,
  };
}
