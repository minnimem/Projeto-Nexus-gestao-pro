import { useEffect, useState } from "react";
import {
  initialLoginForm,
  initialPasswordResetForm,
} from "../constants/loginFormDefaults";

export function useLoginPageState() {
  const [form, setForm] = useState(initialLoginForm);
  const [resetForm, setResetForm] = useState(initialPasswordResetForm);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setResetForm((current) => ({ ...current, token }));
      setAuthMode("reset");
    }
  }, []);

  return {
    authMode,
    error,
    form,
    loading,
    resetForm,
    setAuthMode,
    setError,
    setForm,
    setLoading,
    setResetForm,
    setSuccess,
    success,
  };
}
