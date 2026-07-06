import { useState } from "react";
import { PedidosContent } from "./components/PedidosContent";
import { SalesContextStrip } from "./components/SalesContextStrip";
import { SalesViewTabs } from "./components/SalesViewTabs";
import { usePedidosPageData } from "./hooks/usePedidosPageData";
import "./styles/salesAnalytics.css";
import "./styles/salesFiscal.css";
import "./styles/salesOrders.css";
import "./styles/salesOverview.css";
import "./styles/pointOfSale.css";
import "./styles/salesTheme.css";

export function Pedidos({ data, session, onRefresh }) {
  const [view, setView] = useState("overview");
  const { activeSalesView, clientes, dashboard, produtos, salesContext } = usePedidosPageData({ data, view });

  return (
    <div className="dashboard-view sales-view">
      <SalesViewTabs onChange={setView} view={view} />
      <SalesContextStrip activeSalesView={activeSalesView} salesContext={salesContext} />

      <PedidosContent
        clientes={clientes}
        dashboard={dashboard}
        onRefresh={onRefresh}
        produtos={produtos}
        session={session}
        setView={setView}
        view={view}
      />
    </div>
  );
}
