import { useState } from "react";
import {
  initialCollectionFollowUpForm,
  initialFinanceCategoryForm,
  initialFinanceForm,
} from "../constants/financeFormDefaults";
import { useOrphanHistoryControls } from "./useOrphanHistoryControls";

export function useFinancePageState() {
  const [form, setForm] = useState(initialFinanceForm);
  const [categoryForm, setCategoryForm] = useState(initialFinanceCategoryForm);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [financeFilter, setFinanceFilter] = useState("TODOS");
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState("");
  const [financeBranchFilter, setFinanceBranchFilter] = useState("TODAS");
  const [financePage, setFinancePage] = useState(0);
  const [editingFinanceId, setEditingFinanceId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [collectionFollowUpForm, setCollectionFollowUpForm] = useState(initialCollectionFollowUpForm);
  const orphanHistoryControls = useOrphanHistoryControls();

  return {
    categoryForm,
    collectionFollowUpForm,
    editingFinanceId,
    financeBranchFilter,
    financeCategoryFilter,
    financeFilter,
    financePage,
    form,
    message,
    orphanHistoryControls,
    saving,
    selectedCharge,
    setCategoryForm,
    setCollectionFollowUpForm,
    setEditingFinanceId,
    setFinanceBranchFilter,
    setFinanceCategoryFilter,
    setFinanceFilter,
    setFinancePage,
    setForm,
    setMessage,
    setSaving,
    setSelectedCharge,
    setShowCategoryForm,
    setShowFinanceForm,
    showCategoryForm,
    showFinanceForm,
  };
}
