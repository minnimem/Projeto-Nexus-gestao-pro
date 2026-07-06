import { useRef, useState } from "react";
import { getPeriodPresetRange } from "../../../utils/formatters";
import { initialServiceOrderForm } from "../constants/serviceConstants";

export function useServicePageState() {
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialServiceOrderForm);
  const [formStep, setFormStep] = useState("cliente");
  const [historyStartDate, setHistoryStartDate] = useState(getPeriodPresetRange("month").startKey);
  const [historyEndDate, setHistoryEndDate] = useState(getPeriodPresetRange("month").endKey);
  const [historyClienteId, setHistoryClienteId] = useState("TODOS");
  const [historyTecnicoId, setHistoryTecnicoId] = useState("TODOS");
  const [historyStatus, setHistoryStatus] = useState("TODOS");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState("");
  const [savingChecklist, setSavingChecklist] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState("");
  const [signatureDraft, setSignatureDraft] = useState(null);
  const signatureCanvasRef = useRef(null);
  const signatureDrawingRef = useRef(false);

  return {
    form,
    formStep,
    historyClienteId,
    historyEndDate,
    historyStartDate,
    historyStatus,
    historyTecnicoId,
    message,
    saving,
    savingChecklist,
    savingStatus,
    search,
    setForm,
    setFormStep,
    setHistoryClienteId,
    setHistoryEndDate,
    setHistoryStartDate,
    setHistoryStatus,
    setHistoryTecnicoId,
    setMessage,
    setSaving,
    setSavingChecklist,
    setSavingStatus,
    setSearch,
    setSignatureDraft,
    setStatusFilter,
    setUploadingAttachment,
    signatureCanvasRef,
    signatureDraft,
    signatureDrawingRef,
    statusFilter,
    uploadingAttachment,
  };
}
