import { Search } from "lucide-react";
import "./HeaderSearch.css";

export function HeaderSearch({
  activateModule,
  commandMatches,
  globalSearch,
  globalSearchRef,
  handleCommandKeyDown,
  searchInputRef,
  setGlobalSearch,
}) {
  return (
    <label className="global-search" ref={globalSearchRef}>
      <Search size={16} />
      <input
        onChange={(event) => setGlobalSearch(event.target.value)}
        onKeyDown={handleCommandKeyDown}
        placeholder="Buscar... (Ctrl + K)"
        ref={searchInputRef}
        value={globalSearch}
      />
      {commandMatches.length > 0 && (
        <div className="command-menu">
          {commandMatches.map((module) => {
            const Icon = module.icon;
            return (
              <button key={module.value} onClick={() => activateModule(module.value)} type="button">
                <Icon size={15} />
                <span>{module.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </label>
  );
}
