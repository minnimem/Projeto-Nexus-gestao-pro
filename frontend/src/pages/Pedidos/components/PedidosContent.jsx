import { PointOfSale } from "./PointOfSale";
import { SalesOverview } from "./SalesOverview";

export function PedidosContent({
  clientes,
  dashboard,
  onRefresh,
  produtos,
  session,
  setView,
  view,
}) {
  if (view === "overview") {
    return (
      <SalesOverview
        data={dashboard}
        onNavigate={setView}
        onRefresh={onRefresh}
        section="overview"
        session={session}
      />
    );
  }

  if (view === "fiscal") {
    return <SalesOverview data={dashboard} fiscalOnly onRefresh={onRefresh} session={session} />;
  }

  if (view === "pdv") {
    return (
      <PointOfSale
        clientes={clientes}
        onSaleCreated={onRefresh}
        produtos={produtos}
        session={session}
      />
    );
  }

  return (
    <SalesOverview
      data={dashboard}
      onNavigate={setView}
      onRefresh={onRefresh}
      section={view}
      session={session}
    />
  );
}
