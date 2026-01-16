import { BudgetRelease } from "@/types";
import { formatCurrency, DEFAULT_CURRENCY, CurrencyCode } from "@/lib/currency";
import {
  Trash2,
  TrendingUp,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ReleaseListProps {
  releases: BudgetRelease[];
  currency?: CurrencyCode;
  onDelete: (id: string) => void;
  onEdit: (release: BudgetRelease) => void;
  isOwner: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ReleaseList({
  releases,
  currency = DEFAULT_CURRENCY,
  onDelete,
  onEdit,
  isOwner,
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
          <table className="min-w-full divide-y divide-(--card-border)">
            <thead>
              <tr className="text-left text-xs font-bold text-foreground-muted uppercase tracking-wider">
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4">Note</th>
                <th className="pb-4 px-4 text-right">Amount</th>
                {isOwner && <th className="pb-4 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--card-border) text-sm">
              {releases.map((release) => (
                <tr
                  key={release.id}
                  className="group hover:bg-(--input-bg)/50 transition-colors"
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
                  {isOwner && (
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onEdit(release)}
                        className="p-2 text-foreground-muted hover:text-accent-violet hover:bg-accent-violet/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Release"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(release.id)}
                        className="p-2 text-foreground-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Release"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
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
