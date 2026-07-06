import { useState } from "react";
import {
  initialCustomerFollowUpForm,
  initialCustomerForm,
} from "../constants/customerFormDefaults";

export function useCustomerPageState() {
  const [search, setSearch] = useState("");
  const [customerBranchFilter, setCustomerBranchFilter] = useState("TODAS");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [form, setForm] = useState(initialCustomerForm);
  const [customerFollowUpForm, setCustomerFollowUpForm] = useState(initialCustomerFollowUpForm);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  return {
    customerBranchFilter,
    customerFollowUpForm,
    form,
    message,
    saving,
    search,
    selectedCustomerId,
    setCustomerBranchFilter,
    setCustomerFollowUpForm,
    setForm,
    setMessage,
    setSaving,
    setSearch,
    setSelectedCustomerId,
    setShowCustomerForm,
    showCustomerForm,
  };
}
