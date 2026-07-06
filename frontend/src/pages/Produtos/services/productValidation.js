export function sanitizeProductForm(form, barcode) {
  return {
    sku: String(form.sku || "").trim() || null,
    codBarras: String(barcode || form.codBarras || "").trim(),
    nomeProduto: String(form.nomeProduto || "").trim(),
    descricao: String(form.descricao || "").trim(),
    ncm: String(form.ncm || "").trim() || null,
    cfop: String(form.cfop || "").trim() || null,
    cest: String(form.cest || "").trim() || null,
    origemFiscal: String(form.origemFiscal || "").trim() || null,
    unidadeComercial: String(form.unidadeComercial || "").trim() || "UN",
    cstIcms: String(form.cstIcms || "").trim() || null,
    csosn: String(form.csosn || "").trim() || null,
    aliquotaIcms: form.aliquotaIcms === "" ? null : Number(form.aliquotaIcms),
    aliquotaPis: form.aliquotaPis === "" ? null : Number(form.aliquotaPis),
    aliquotaCofins: form.aliquotaCofins === "" ? null : Number(form.aliquotaCofins),
    aliquotaIpi: form.aliquotaIpi === "" ? null : Number(form.aliquotaIpi),
    codigoServicoMunicipal: String(form.codigoServicoMunicipal || "").trim() || null,
    codigoServicoNacional: String(form.codigoServicoNacional || "").trim() || null,
    aliquotaIss: form.aliquotaIss === "" ? null : Number(form.aliquotaIss),
    precoCompra: Number(form.precoCompra),
    precoVenda: Number(form.precoVenda),
    descontoPercentual: Number(form.descontoPercentual || 0),
    qtaMinimo: Number(form.qtaMinimo || 0),
    qtaMaximo: form.qtaMaximo === "" ? null : Number(form.qtaMaximo),
    garantiaMes: Number(form.garantiaMes || 0),
    idCategoria: form.idCategoria || null,
    idMarca: form.idMarca || null,
    idFornecedor: form.idFornecedor || null,
  };
}

export function validateProductForm(form, produtos = []) {
  const nomeProduto = String(form.nomeProduto || "").trim();
  const existingProduct = produtos.find(
    (produto) => String(produto.nome || produto.nomeProduto || "").trim().toLowerCase() === nomeProduto.toLowerCase(),
  );
  const precoCompra = Number(form.precoCompra);
  const precoVenda = Number(form.precoVenda);
  const qtaMinimo = Number(form.qtaMinimo || 0);
  const qtaMaximo = Number(form.qtaMaximo || 0);
  const descontoPercentual = Number(form.descontoPercentual || 0);

  if (!nomeProduto) return { valid: false, message: "Informe o nome do produto." };
  if (existingProduct) {
    return {
      valid: false,
      message: `Produto "${existingProduct.nome || existingProduct.nomeProduto}" já existe. Atualize o cadastro existente para não criar duplicidade.`,
    };
  }
  if (precoCompra <= 0 || precoVenda <= 0) return { valid: false, message: "Informe preços maiores que zero." };
  if (descontoPercentual < 0 || descontoPercentual > 100) return { valid: false, message: "Desconto deve ficar entre 0% e 100%." };
  if (qtaMinimo < 0 || qtaMaximo < 0) return { valid: false, message: "Limites de estoque não podem ser negativos." };
  if (qtaMaximo > 0 && qtaMinimo > qtaMaximo) {
    return { valid: false, message: "Estoque mínimo não pode ser maior que o estoque máximo." };
  }

  return { valid: true, message: "" };
}
