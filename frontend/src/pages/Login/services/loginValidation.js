export function validateRecoveryLogin(login) {
  if (!String(login || "").trim()) {
    return "Informe o login do usuário.";
  }
  return "";
}

export function validatePasswordResetForm({ token, novaSenha, confirmarSenha }) {
  if (!String(token || "").trim()) {
    return "Informe o token de recuperação.";
  }
  if (String(novaSenha || "").length < 6) {
    return "Nova senha precisa ter no mínimo 6 caracteres.";
  }
  if (novaSenha !== confirmarSenha) {
    return "As senhas não conferem.";
  }
  return "";
}
