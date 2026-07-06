import {
  PackageCheck,
  Route,
  ShoppingCart,
  WalletCards,
} from "lucide-react";
import "./LoginBrandPanel.css";

export function LoginBrandPanel() {
  return (
    <section className="login-brand-panel">
      <div className="login-brand">
        <span>N</span>
        <div>
          <strong>Nexus One</strong>
          <small>ERP comercial integrado</small>
        </div>
      </div>

      <div className="login-brand-copy">
        <p>Controle empresarial</p>
        <h1>Nexus One centraliza vendas, estoque, financeiro e logística.</h1>
        <span>
          Front React JSX preparado para consumir o Spring Boot na porta 8081
          com JWT e PostgreSQL.
        </span>
      </div>

      <div className="login-brand-metrics">
        <article>
          <ShoppingCart size={18} />
          <strong>Pedidos</strong>
          <span>/pedidos</span>
        </article>
        <article>
          <PackageCheck size={18} />
          <strong>Estoque</strong>
          <span>/produtos</span>
        </article>
        <article>
          <WalletCards size={18} />
          <strong>Financeiro</strong>
          <span>/financeiro</span>
        </article>
        <article>
          <Route size={18} />
          <strong>Logística</strong>
          <span>/logistica</span>
        </article>
      </div>
    </section>
  );
}
