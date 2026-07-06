import { formatNumber } from "../../../utils/formatters.js";
import { SEPARATION_STAGE_OPTIONS } from "../constants/separation.js";

export function SeparationStageSummary({ stageCounts, stageFilter, toggleStage }) {
  return (
    <div className="separation-stage-summary">
      {SEPARATION_STAGE_OPTIONS.slice(1).map((option) => (
        <button
          className={stageFilter === option.value ? "active" : ""}
          key={option.value}
          onClick={() => toggleStage(option.value)}
          type="button"
        >
          <span>{option.label}</span>
          <strong>{formatNumber(stageCounts[option.value])}</strong>
        </button>
      ))}
    </div>
  );
}
