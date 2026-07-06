const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8081";

function getToken() {
  return sessionStorage.getItem("nexus.token");
}

function getErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    if (data.message || data.mensagem || data.error) {
      return data.message || data.mensagem || data.error;
    }
    const validationMessages = Object.values(data)
      .filter((value) => typeof value === "string" && value.trim())
      .filter((value) => !/^\d{4}-\d{2}-\d{2}T/.test(value));
    if (validationMessages.length > 0) return validationMessages.join(" ");
  }
  return fallback;
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Erro ao comunicar com a API."));
  }

  return data;
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: (path, formData) =>
    apiFetch(path, { method: "POST", body: formData }),
  put: (path, body) =>
    apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) =>
    apiFetch(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: (path) => apiFetch(path, { method: "DELETE" }),
};
