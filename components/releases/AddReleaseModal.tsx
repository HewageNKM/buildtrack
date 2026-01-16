import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, DollarSign, FileText, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { BudgetRelease } from "@/types";

interface AddReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onReleaseAdded: () => void;
  remainingEstimation: number;
  initialData?: BudgetRelease;
}

export default function AddReleaseModal({
  isOpen,
  onClose,
  projectId,
  onReleaseAdded,
  remainingEstimation,
  initialData,
}: AddReleaseModalProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(initialData.amount?.toString() || "");
        setDate(
          initialData.date?.split("T")[0] ||
            new Date().toISOString().split("T")[0]
        );
        setNote(initialData.note || "");
      } else {
        // Reset for new release
        setAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        setNote("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const releaseAmount = parseFloat(amount);
      if (isNaN(releaseAmount) || releaseAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      if (releaseAmount > remainingEstimation) {
        toast.error(
          "Release amount cannot exceed the project's remaining estimated budget."
        );
        return;
      }

      if (initialData) {
        // Update existing release
        await api.releases.update(projectId, initialData.id, {
          amount: releaseAmount,
          date,
          note,
        });
        toast.success("Release updated successfully");
      } else {
        // Create new release
        await api.releases.create(projectId, {
          amount: releaseAmount,
          date,
          note,
        });
        toast.success("Funds released successfully");
      }

      onReleaseAdded();
      onClose();
    } catch (error: any) {
      console.error("Error creating release:", error);
      toast.error(error.response?.data?.error || "Failed to release funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden glass-card rounded-3xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {initialData ? "Edit Release" : "Release Funds"}
                </h2>
                <p className="text-sm text-foreground-muted mt-1">
                  Add funds to the working capital
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[var(--input-bg)] text-foreground-muted hover:text-foreground transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground-muted">
                  Amount
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted w-5 h-5 flex items-center justify-center font-bold">
                    {/* Assuming default currency for icon, or use currency code */}
                    <span className="text-xs">{DEFAULT_CURRENCY}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3.5 pl-12 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-foreground font-semibold placeholder:text-foreground-muted/50 focus:border-accent-violet focus:ring-1 focus:ring-accent-violet outline-none transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="mt-2 text-xs text-foreground-muted">
                  Allowed: {remainingEstimation.toLocaleString()}{" "}
                  {DEFAULT_CURRENCY}
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground-muted">
                  Date
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3.5 pl-12 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-foreground font-medium focus:border-accent-violet focus:ring-1 focus:ring-accent-violet outline-none transition-all dark:[color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground-muted">
                  Note (Optional)
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-3.5 pointer-events-none text-foreground-muted">
                    <FileText className="w-5 h-5" />
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3.5 pl-12 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-foreground font-medium placeholder:text-foreground-muted/50 focus:border-accent-violet focus:ring-1 focus:ring-accent-violet outline-none transition-all resize-none"
                    placeholder="e.g., Phase 1 Mobilization"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-accent-violet to-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      {initialData ? "Save Changes" : "Release Funds"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
