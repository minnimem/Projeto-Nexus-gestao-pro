import { CalendarDays } from "lucide-react";
import { periodPresets } from "../../constants/modules";
import { formatPeriodRange } from "../../utils/formatters";
import "./HeaderPeriodSelector.css";

export function HeaderPeriodSelector({
  activePeriodLabel,
  periodMenuRef,
  periodPreset,
  setPeriodPreset,
  setShowPeriodMenu,
  showPeriodMenu,
}) {
  return (
    <div className="topbar-period-wrapper" ref={periodMenuRef}>
      <button className="topbar-period-chip" onClick={() => setShowPeriodMenu((current) => !current)} type="button">
        <CalendarDays size={15} />
        <span>{activePeriodLabel}</span>
      </button>
      {showPeriodMenu && (
        <div className="period-menu">
          {Object.entries(periodPresets).map(([value, label]) => (
            <button
              className={periodPreset === value ? "active" : ""}
              key={value}
              onClick={() => {
                setPeriodPreset(value);
                setShowPeriodMenu(false);
              }}
              type="button"
            >
              <strong>{label}</strong>
              <small>{formatPeriodRange(value)}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
