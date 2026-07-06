import assert from "node:assert/strict";
import test from "node:test";

import { validatePasswordResetForm, validateRecoveryLogin } from "./loginValidation.js";

test("validateRecoveryLogin exige login preenchido", () => {
  assert.equal(validateRecoveryLogin(""), "Informe o login do usuário.");
  assert.equal(validateRecoveryLogin("   "), "Informe o login do usuário.");
  assert.equal(validateRecoveryLogin("admin"), "");
});

test("validatePasswordResetForm exige token", () => {
  assert.equal(
    validatePasswordResetForm({ token: "", novaSenha: "123456", confirmarSenha: "123456" }),
    "Informe o token de recuperação.",
  );
});

test("validatePasswordResetForm exige senha minima", () => {
  assert.equal(
    validatePasswordResetForm({ token: "abc", novaSenha: "123", confirmarSenha: "123" }),
    "Nova senha precisa ter no mínimo 6 caracteres.",
  );
});

test("validatePasswordResetForm exige confirmacao igual", () => {
  assert.equal(
    validatePasswordResetForm({ token: "abc", novaSenha: "123456", confirmarSenha: "654321" }),
    "As senhas não conferem.",
  );
});

test("validatePasswordResetForm aceita dados validos", () => {
  assert.equal(
    validatePasswordResetForm({ token: "abc", novaSenha: "123456", confirmarSenha: "123456" }),
    "",
  );
});
