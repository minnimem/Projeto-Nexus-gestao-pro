import "./DashboardModuleNavigation.css";

export function DashboardModuleNavigation({
  active,
  onActivate,
  quickActions,
  visibleModules,
}) {
  return (
    <>
      <nav className="module-tabs" aria-label="Módulos do sistema">
        {visibleModules.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={active === item.value ? "active" : ""}
              key={item.value}
              onClick={() => onActivate(item.value)}
              type="button"
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {quickActions.length > 0 && (
        <section className="quick-action-strip" aria-label="Ações rápidas">
          <span>Ações rápidas</span>
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.value} onClick={() => onActivate(item.value)} type="button">
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </section>
      )}
    </>
  );
}
