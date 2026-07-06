import { SALES_VIEWS } from "../constants/salesNavigation";

export function SalesViewTabs({ onChange, view }) {
  return (
    <div className="view-switch sales-module-switch" role="tablist" aria-label="Vendas">
      {SALES_VIEWS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            className={view === item.value ? "active" : ""}
            key={item.value}
            onClick={() => onChange(item.value)}
            type="button"
          >
            <Icon size={17} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
