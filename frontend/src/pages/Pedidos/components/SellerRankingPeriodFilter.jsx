import { X } from "lucide-react";

export function SellerRankingPeriodFilter({ sellerRankingFilter, setSellerRankingFilter }) {
  return (
    <div className="sales-period-filter seller-ranking-filter">
      <label>
        <span>Início</span>
        <input
          type="date"
          value={sellerRankingFilter.inicio}
          onChange={(event) => setSellerRankingFilter((current) => ({ ...current, inicio: event.target.value }))}
        />
      </label>
      <label>
        <span>Fim</span>
        <input
          type="date"
          value={sellerRankingFilter.fim}
          onChange={(event) => setSellerRankingFilter((current) => ({ ...current, fim: event.target.value }))}
        />
      </label>
      <button
        disabled={!sellerRankingFilter.inicio && !sellerRankingFilter.fim}
        onClick={() => setSellerRankingFilter({ inicio: "", fim: "" })}
        type="button"
      >
        <X size={16} />
        Limpar período
      </button>
    </div>
  );
}
