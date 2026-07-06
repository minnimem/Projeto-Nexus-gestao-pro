import { useEffect, useState } from "react";
import {
  initialBrandForm,
  initialInventoryCountForm,
  initialProductCategoryForm,
  initialProductForm,
  initialPurchaseForm,
  initialStockTransferForm,
  initialSupplierForm,
} from "../constants/productFormDefaults";

const initialStockAdjustment = {
  produtoId: "",
  quantidade: 1,
  type: "entrada",
};

export function useProductPageState() {
  const [search, setSearch] = useState("");
  const [productPage, setProductPage] = useState(0);
  const [inventoryBranchFilter, setInventoryBranchFilter] = useState("TODAS");
  const [stockProductSearch, setStockProductSearch] = useState("");
  const [productForm, setProductForm] = useState(initialProductForm);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [productMessage, setProductMessage] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showProductCategoryForm, setShowProductCategoryForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [supplierForm, setSupplierForm] = useState(initialSupplierForm);
  const [productCategoryForm, setProductCategoryForm] = useState(initialProductCategoryForm);
  const [brandForm, setBrandForm] = useState(initialBrandForm);
  const [supplierSaving, setSupplierSaving] = useState(false);
  const [productCategorySaving, setProductCategorySaving] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState(initialPurchaseForm);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [purchaseSaving, setPurchaseSaving] = useState(false);
  const [inventoryCountForm, setInventoryCountForm] = useState(initialInventoryCountForm);
  const [inventorySaving, setInventorySaving] = useState(false);
  const [stockTransferForm, setStockTransferForm] = useState(initialStockTransferForm);
  const [stockTransferSaving, setStockTransferSaving] = useState(false);
  const [labelPreviewProductId, setLabelPreviewProductId] = useState("");
  const [adjustment, setAdjustment] = useState(initialStockAdjustment);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setProductPage(0);
  }, [search, inventoryBranchFilter]);

  return {
    adjustment,
    brandForm,
    brandSaving,
    inventoryBranchFilter,
    inventoryCountForm,
    inventorySaving,
    labelPreviewProductId,
    message,
    productCategoryForm,
    productCategorySaving,
    productForm,
    productMessage,
    productPage,
    productSaving,
    purchaseForm,
    purchaseItems,
    purchaseSaving,
    saving,
    search,
    setAdjustment,
    setBrandForm,
    setBrandSaving,
    setInventoryBranchFilter,
    setInventoryCountForm,
    setInventorySaving,
    setLabelPreviewProductId,
    setMessage,
    setProductCategoryForm,
    setProductCategorySaving,
    setProductForm,
    setProductMessage,
    setProductPage,
    setProductSaving,
    setPurchaseForm,
    setPurchaseItems,
    setPurchaseSaving,
    setSaving,
    setSearch,
    setShowBrandForm,
    setShowProductCategoryForm,
    setShowProductForm,
    setShowSupplierForm,
    setStockProductSearch,
    setStockTransferForm,
    setStockTransferSaving,
    setSupplierForm,
    setSupplierSaving,
    showBrandForm,
    showProductCategoryForm,
    showProductForm,
    showSupplierForm,
    stockProductSearch,
    stockTransferForm,
    stockTransferSaving,
    supplierForm,
    supplierSaving,
  };
}
