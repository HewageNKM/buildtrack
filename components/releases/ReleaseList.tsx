import { BudgetRelease } from "@/types";
import { formatCurrency, DEFAULT_CURRENCY, CurrencyCode } from "@/lib/currency";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

interface ReleaseListProps {
  releases: BudgetRelease[];
  currency?: CurrencyCode;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ReleaseList({
  releases,
  currency = DEFAULT_CURRENCY,
  currentPage,
  totalPages,
  onPageChange,
}: ReleaseListProps) {
  if (releases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[var(--input-bg)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--input-border)]">
          <TrendingUp className="w-8 h-8 text-foreground-muted" />
        </div>
        <h4 className="text-lg font-bold text-foreground">No funds released</h4>
        <p className="text-foreground-muted max-w-sm mx-auto">
          No funds have been released for this project yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle px-6">
          <table className="min-w-full divide-y divide-[var(--card-border)]">
            <thead>
              <tr className="text-left text-xs font-bold text-foreground-muted uppercase tracking-wider">
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4">Note</th>
                <th className="pb-4 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)] text-sm">
              {releases.map((release) => (
                <tr
                  key={release.id}
                  className="hover:bg-[var(--input-bg)]/50 transition-colors"
                >
                  <td className="py-4 px-4 text-foreground whitespace-nowrap font-medium">
                    {new Date(release.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-foreground-muted">
                    {release.note || "—"}
                  </td>
                  <td className="py-4 px-4 font-bold text-foreground text-right">
                    {formatCurrency(release.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-[var(--card-border)]">
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] hover:bg-[var(--input-focus-bg)] text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <span className="text-sm font-bold text-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] hover:bg-[var(--input-focus-bg)] text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
