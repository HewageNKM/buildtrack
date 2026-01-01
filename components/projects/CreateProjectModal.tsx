"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  HardHat,
  Calendar,
  AlertCircle,
  Sparkles,
  Coins,
  FileText,
  Tag,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  CurrencyCode,
  CURRENCY_LIST,
  DEFAULT_CURRENCY,
  getCurrencySymbol,
} from "@/lib/currency";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: {
    name: string;
    description: string;
    estimatedBudget: number;
    currency: CurrencyCode;
    startDate: string;
    endDate?: string;
  }) => Promise<void>;
  initialData?: {
    name: string;
    description: string;
    estimatedBudget: number;
    currency?: CurrencyCode;
    startDate: string;
    endDate?: string;
  };
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProjectModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [estimatedBudget, setEstimatedBudget] = useState(
    initialData?.estimatedBudget?.toString() || ""
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    initialData?.currency || DEFAULT_CURRENCY
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
      setEstimatedBudget(initialData?.estimatedBudget?.toString() || "");
      setCurrency(initialData?.currency || DEFAULT_CURRENCY);
      setStartDate(
        initialData?.startDate || new Date().toISOString().split("T")[0]
      );
      setEndDate(initialData?.endDate || "");
      setError("");
    }
  }, [isOpen, initialData]);

  useBodyScrollLock(isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    const budget = parseFloat(estimatedBudget);
    if (isNaN(budget) || budget <= 0) {
      setError("Please enter a valid budget amount");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        estimatedBudget: budget,
        currency,
        startDate,
        endDate: endDate || undefined,
      });

      if (!initialData) {
        setName("");
        setDescription("");
        setEstimatedBudget("");
        setCurrency(DEFAULT_CURRENCY);
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate("");
      }
      onClose();
    } catch (err) {
      setError("Failed to save project. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Shared classes
  const labelClass =
    "flex items-center gap-2 text-sm font-semibold mb-2 text-foreground-muted";
  const inputClass =
    "w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-accent-pink/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(236,72,153,0.1)] outline-none transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-[500px] glass-card border-white/10 rounded-3xl overflow-y-auto max-h-[90vh] scrollbar-hide"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 sticky top-0 z-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-accent-pink to-rose-400 shadow-lg shadow-pink-500/30 text-white">
                  <HardHat className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {initialData ? "Edit Project" : "New Project"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <motion.div
                  className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="mb-5">
                <label className={labelClass}>
                  <Tag className="w-4 h-4 text-accent-cyan" />
                  Project Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Office Renovation 2024"
                  required
                />
              </div>

              <div className="mb-5">
                <label className={labelClass}>
                  <FileText className="w-4 h-4 text-accent-violet" />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClass} min-h-[80px] resize-none`}
                  placeholder="Brief description of the project..."
                />
              </div>

              {/* Budget and Currency Row */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelClass}>
                    <Coins className="w-4 h-4 text-emerald-400" />
                    Estimated Budget *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-foreground-muted font-bold text-sm">
                        {getCurrencySymbol(currency)}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(e.target.value)}
                      className={`${inputClass} pl-12`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    <Coins className="w-4 h-4 text-amber-400" />
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) =>
                      setCurrency(e.target.value as CurrencyCode)
                    }
                    className={inputClass}
                    style={{ appearance: "none" }} // Ensure default arrow doesn't look weird, can add custom arrow if needed but standard select is okay with this class
                  >
                    {CURRENCY_LIST.map((curr) => (
                      <option
                        key={curr.code}
                        value={curr.code}
                        className="bg-background-secondary text-foreground"
                      >
                        {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className={labelClass}>
                    <Calendar className="w-4 h-4 text-accent-violet" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <Calendar className="w-4 h-4 text-accent-pink" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputClass}
                    min={startDate}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 text-foreground hover:bg-white/10 font-bold transition-all text-sm border border-white/5"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-accent-pink to-rose-500 text-white font-bold shadow-lg shadow-pink-500/25 hover:from-pink-500 hover:to-rose-400 transition-all text-sm flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {initialData ? "Save Changes" : "Create Project"}
                      </span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
