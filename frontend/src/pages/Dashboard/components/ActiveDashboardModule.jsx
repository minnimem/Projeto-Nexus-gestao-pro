import { lazy, Suspense } from "react";
import { ModulePreview } from "../../../components/common/ModulePreview";

const AdminEmpresas = lazy(() => import("../../AdminEmpresas/AdminEmpresas").then((module) => ({ default: module.AdminEmpresas })));
const Caixa = lazy(() => import("../../Caixa/Caixa").then((module) => ({ default: module.Caixa })));
const Clientes = lazy(() => import("../../Clientes/Clientes").then((module) => ({ default: module.Clientes })));
const Colaboradores = lazy(() => import("../../Colaboradores/Colaboradores").then((module) => ({ default: module.Colaboradores })));
const Financeiro = lazy(() => import("../../Financeiro/Financeiro").then((module) => ({ default: module.Financeiro })));
const Logistica = lazy(() => import("../../Logistica/Logistica").then((module) => ({ default: module.Logistica })));
const Pedidos = lazy(() => import("../../Pedidos/Pedidos").then((module) => ({ default: module.Pedidos })));
const Produtos = lazy(() => import("../../Produtos/Produtos").then((module) => ({ default: module.Produtos })));
const Relatorios = lazy(() => import("../../Relatorios/Relatorios").then((module) => ({ default: module.Relatorios })));
const Servicos = lazy(() => import("../../Servicos/Servicos").then((module) => ({ default: module.Servicos })));
const Usuarios = lazy(() => import("../../Usuarios/Usuarios").then((module) => ({ default: module.Usuarios })));
const VisaoGeral = lazy(() => import("../../VisaoGeral/VisaoGeral").then((module) => ({ default: module.VisaoGeral })));

export function ActiveDashboardModule({
  active,
  activeModule,
  data,
  onRefresh,
  periodPreset,
  periodRange,
  session,
}) {
  const moduleProps = { data, onRefresh, session };
  let content;

  switch (active) {
    case "overview":
      content = <VisaoGeral data={data} periodPreset={periodPreset} periodRange={periodRange} session={session} />;
      break;
    case "pedidos":
      content = <Pedidos {...moduleProps} />;
      break;
    case "clientes":
      content = <Clientes data={data} onRefresh={onRefresh} />;
      break;
    case "servicos":
      content = <Servicos {...moduleProps} />;
      break;
    case "caixa":
      content = <Caixa {...moduleProps} />;
      break;
    case "produtos":
      content = <Produtos {...moduleProps} />;
      break;
    case "financeiro":
      content = <Financeiro {...moduleProps} />;
      break;
    case "logistica":
      content = <Logistica {...moduleProps} />;
      break;
    case "relatorios":
      content = <Relatorios data={data} session={session} />;
      break;
    case "colaboradores":
      content = <Colaboradores data={data} />;
      break;
    case "usuarios":
      content = <Usuarios {...moduleProps} />;
      break;
    case "empresas":
      content = <AdminEmpresas data={data} onRefresh={onRefresh} />;
      break;
    default:
      return <ModulePreview module={activeModule} data={data} />;
  }

  return (
    <Suspense fallback={<div className="loading-state">Carregando módulo...</div>}>
      {content}
    </Suspense>
  );
}
