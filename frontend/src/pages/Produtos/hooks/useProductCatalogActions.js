import {
  initialBrandForm,
  initialProductCategoryForm,
  initialProductForm,
  initialSupplierForm,
} from "../constants/productFormDefaults";
import { productService } from "../services/productService.js";
import { sanitizeProductForm, validateProductForm } from "../services/productValidation.js";
import { generateProductBarcode } from "../utils/productUtils";

export function useProductCatalogActions({
  brandForm,
  onRefresh,
  productCategoryForm,
  productForm,
  produtos,
  setBrandForm,
  setBrandSaving,
  setProductCategoryForm,
  setProductCategorySaving,
  setProductForm,
  setProductMessage,
  setProductSaving,
  setPurchaseForm,
  setShowBrandForm,
  setShowProductCategoryForm,
  setShowProductForm,
  setShowSupplierForm,
  setSupplierForm,
  setSupplierSaving,
  supplierForm,
}) {
  function updateProductForm(field, value) {
    setProductForm((current) => ({ ...current, [field]: value }));
  }

  function handleGenerateBarcode() {
    updateProductForm("codBarras", generateProductBarcode(produtos));
    setProductMessage({ type: "success", text: "Código de barras gerado automaticamente." });
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    const validation = validateProductForm(productForm, produtos);
    if (!validation.valid) return setProductMessage({ type: "error", text: validation.message });

    setProductSaving(true);
    setProductMessage(null);
    const codigoBarras = productForm.codBarras.trim() || generateProductBarcode(produtos);
    if (!productForm.codBarras.trim()) updateProductForm("codBarras", codigoBarras);

    try {
      await productService.createProduct(sanitizeProductForm(productForm, codigoBarras));
      setProductForm(initialProductForm);
      setProductMessage({ type: "success", text: "Produto cadastrado com sucesso." });
      setShowProductForm(false);
      await onRefresh();
    } catch (error) {
      setProductMessage({ type: "error", text: error.message });
    } finally {
      setProductSaving(false);
    }
  }

  async function handleCreateSupplier(event) {
    event.preventDefault();
    if (!supplierForm.nome.trim() || !supplierForm.documento.trim()) {
      return setProductMessage({ type: "error", text: "Informe nome e documento do fornecedor." });
    }
    setSupplierSaving(true);
    setProductMessage(null);
    try {
      const fornecedor = await productService.createSupplier({
        nome: supplierForm.nome.trim(),
        tipoDocumento: supplierForm.tipoDocumento,
        documento: supplierForm.documento.replace(/\D/g, ""),
        telefone: supplierForm.telefone.trim(),
        email: supplierForm.email.trim() || null,
        endereco: supplierForm.endereco.trim(),
      });
      setSupplierForm(initialSupplierForm);
      setShowSupplierForm(false);
      setProductForm((current) => ({ ...current, idFornecedor: fornecedor.id || "" }));
      setPurchaseForm((current) => ({ ...current, fornecedorId: fornecedor.id || current.fornecedorId }));
      setProductMessage({ type: "success", text: "Fornecedor cadastrado com sucesso." });
      await onRefresh();
    } catch (error) {
      setProductMessage({ type: "error", text: error.message });
    } finally {
      setSupplierSaving(false);
    }
  }

  async function handleCreateProductCategory(event) {
    event.preventDefault();
    if (!productCategoryForm.nome.trim()) return setProductMessage({ type: "error", text: "Informe o nome da categoria." });
    setProductCategorySaving(true);
    setProductMessage(null);
    try {
      const categoria = await productService.createCategory({
        nome: productCategoryForm.nome.trim(),
        descricao: productCategoryForm.descricao.trim(),
        tipo: "PRODUTO",
        ativo: true,
      });
      setProductCategoryForm(initialProductCategoryForm);
      setShowProductCategoryForm(false);
      setProductForm((current) => ({ ...current, idCategoria: categoria.id || "" }));
      setProductMessage({ type: "success", text: "Categoria de produto cadastrada." });
      await onRefresh();
    } catch (error) {
      setProductMessage({ type: "error", text: error.message });
    } finally {
      setProductCategorySaving(false);
    }
  }

  async function handleCreateBrand(event) {
    event.preventDefault();
    if (!brandForm.nome.trim()) return setProductMessage({ type: "error", text: "Informe o nome da marca." });
    setBrandSaving(true);
    setProductMessage(null);
    try {
      const marca = await productService.createBrand({
        nome: brandForm.nome.trim(),
        descricao: brandForm.descricao.trim(),
      });
      setBrandForm(initialBrandForm);
      setShowBrandForm(false);
      setProductForm((current) => ({ ...current, idMarca: marca.id || "" }));
      setProductMessage({ type: "success", text: "Marca cadastrada." });
      await onRefresh();
    } catch (error) {
      setProductMessage({ type: "error", text: error.message });
    } finally {
      setBrandSaving(false);
    }
  }

  return {
    handleCreateBrand,
    handleCreateProduct,
    handleCreateProductCategory,
    handleCreateSupplier,
    handleGenerateBarcode,
    updateProductForm,
  };
}
