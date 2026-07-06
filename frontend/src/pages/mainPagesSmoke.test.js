import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const pagesDir = join(root, "src", "pages");

const mainPages = [
  "Login",
  "Dashboard",
  "VisaoGeral",
  "Pedidos",
  "Caixa",
  "Clientes",
  "Produtos",
  "Financeiro",
  "Servicos",
  "Logistica",
  "Relatorios",
  "Usuarios",
  "AdminEmpresas",
  "Colaboradores",
];

test("telas principais mantem arquivo JSX e export nomeado", () => {
  for (const page of mainPages) {
    const pageFile = join(pagesDir, page, `${page}.jsx`);
    assert.equal(existsSync(pageFile), true, `${page}.jsx deve existir`);

    const source = readFileSync(pageFile, "utf8");
    assert.match(source, new RegExp(`export function ${page}\\b`), `${page}.jsx deve exportar ${page}`);
  }
});

test("rotas principais continuam conectando Login e Dashboard", () => {
  const source = readFileSync(join(root, "src", "routes", "AppRoutes.jsx"), "utf8");

  assert.match(source, /import \{ Dashboard \} from "\.\.\/pages\/Dashboard\/Dashboard"/);
  assert.match(source, /import \{ Login \} from "\.\.\/pages\/Login\/Login"/);
  assert.match(source, /<PrivateRoute\b/);
  assert.match(source, /<Dashboard\b/);
  assert.match(source, /<Login\b/);
});

test("dashboard continua renderizando workspace operacional", () => {
  const source = readFileSync(join(pagesDir, "Dashboard", "Dashboard.jsx"), "utf8");

  assert.match(source, /DashboardLayout/);
  assert.match(source, /Header/);
  assert.match(source, /Sidebar/);
  assert.match(source, /DashboardWorkspace/);
});
