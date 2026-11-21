# API - Autenticacao

Documentacao dos controllers AuthController e PasswordController.

Prefixo das rotas: `/auth`

Formato: JSON (`Content-Type: application/json`).

---

## 1. Login

**Metodo:** POST

**Rota:** `/auth/login`

**Descricao:** realiza a autenticacao do usuario.

### Requisicao

```json
{
  "login": "usuario",
  "senha": "sua_senha"
}
```

Ambos os campos sao obrigatorios.

**Resposta de sucesso:** `200 OK`.

O formato do retorno sera confirmado no UsuarioService.

---

## 2. Cadastro de usuario

**Metodo:** POST

**Rota:** `/auth/cadastro`

**Permissao:** ADMIN ou GERENTE.

### Requisicao

```json
{
  "nome": "Nome do Usuario",
  "login": "usuario",
  "senha": "senha123",
  "cargo": "Vendedor",
  "departamento": "Comercial",
  "telefone": "62999999999",
  "email": "usuario@exemplo.com",
  "documento": "00000000000"
}
```

### Campos disponiveis

| Campo | Tipo | Regra |
|---|---|---|
| nome | String | Obrigatorio |
| login | String | Obrigatorio |
| senha | String | Minimo de 6 caracteres, quando informada |
| perfil | Perfil | Opcional no DTO |
| filialId | UUID | Opcional |
| cargo | String | Opcional |
| departamento | String | Opcional |
| salario | BigDecimal | Opcional |
| metaVendas | BigDecimal | Opcional |
| dataInicio | LocalDate | Opcional |
| telefone | String | Opcional |
| email | String | Opcional |
| documento | String | Opcional |

**Resposta:** `201 Created`.

```json
{
  "mensagem": "Cadastro realizado com sucesso"
}
```

---

## 3. Recuperar senha

**Metodo:** POST

**Rota:** `/auth/recuperar`

### Requisicao

```json
{
  "login": "usuario"
}
```

### Resposta

```json
{
  "mensagem": "Se o usuario existir, enviaremos instrucoes"
}
```

---

## 4. Redefinir senha

**Metodo:** POST

**Rota:** `/auth/resetar`

### Requisicao

```json
{
  "token": "TOKEN_RECEBIDO",
  "novaSenha": "novaSenha123"
}
```

### Resposta

```json
{
  "mensagem": "Senha alterada com sucesso"
}
```

---

## Observacoes tecnicas

- O cadastro exige perfil ADMIN ou GERENTE.
- A seguranca global da API ainda precisa ser analisada.
- O retorno do login sera confirmado no UsuarioService.
- As regras do token e da nova senha serao confirmadas no PasswordResetService.
- Os codigos de erro ainda precisam ser verificados.

## Arquivos de referencia

- AuthController.java
- PasswordController.java
- LoginRequest.java
- UsuarioRequest.java
