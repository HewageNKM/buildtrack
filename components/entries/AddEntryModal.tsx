"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  DollarSign,
  Tag,
  Paperclip,
} from "lucide-react";
import {
  BUDGET_CATEGORIES,
  BudgetCategory,
  BudgetEntry,
  MATERIAL_TYPES,
} from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onEntryAdded: () => void;
  initialData?: BudgetEntry;
}

export default function AddEntryModal({
  isOpen,
  onClose,
  projectId,
  onEntryAdded,
  initialData,
}: AddEntryModalProps) {
  const [category, setCategory] = useState<BudgetCategory>("materials");
  const [subCategory, setSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoice, setInvoice] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategory(initialData.category);
        setSubCategory(initialData.subCategory || "");
        setDescription(initialData.description);
        setAmount(initialData.amount.toString());
        setDate(initialData.date.split("T")[0]);
      } else {
        setCategory("materials");
        setSubCategory("");
        setDescription("");
        setAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        setInvoice(null);
      }
      setError("");
    }
  }, [isOpen, initialData]);

  useBodyScrollLock(isOpen);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setInvoice(file);
      } else {
        setError("Only images and PDF files are allowed");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setLoading(true);

    try {
      const data = {
        category,
        subCategory: category === "materials" ? subCategory : undefined,
        description: description.trim(),
        amount: parsedAmount,
        date,
        invoice: invoice || undefined,
      };

      if (initialData) {
        await api.entries.update(projectId, initialData.id, data);
        toast.success("Entry updated successfully");
      } else {
        await api.entries.create(projectId, data);
        toast.success("Entry added successfully");
      }

      onEntryAdded();
      onClose();

      if (!initialData) {
        setCategory("materials");
        setSubCategory("");
        setDescription("");
        setAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        setInvoice(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save entry");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeInvoice = () => setInvoice(null);
  const showSubCategory = category === "materials";

  // Shared classes
  const labelClass =
    "flex items-center gap-2 text-sm font-semibold mb-2 text-foreground-muted";
  const inputClass =
    "w-full px-4 py-3.5 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-accent-violet/50 focus:bg-[var(--input-focus-bg)] focus:shadow-md outline-none transition-all";

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
            className="w-full max-w-[520px] glass-card rounded-3xl overflow-y-auto max-h-[90vh] shadow-2xl scrollbar-hide"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)] bg-[var(--card)] sticky top-0 z-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-indigo-600 shadow-lg shadow-indigo-500/30 text-white">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {initialData ? "Edit Entry" : "Add Entry"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--input-bg)] text-foreground-muted hover:bg-[var(--input-focus-bg)] hover:text-foreground transition-colors border border-[var(--input-border)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <motion.div
                  className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={labelClass}>
                    <Tag className="w-4 h-4 text-accent-cyan" />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as BudgetCategory);
                      setSubCategory("");
                    }}
                    className={inputClass}
                    style={{ appearance: "none" }}
                  >
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option
                        key={cat.value}
                        value={cat.value}
                        className="bg-background-secondary text-foreground"
                      >
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {showSubCategory && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <label className={labelClass}>
                      <Tag className="w-4 h-4 text-indigo-400" />
                      Material Type
                    </label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className={inputClass}
                      style={{ appearance: "none" }}
                    >
                      <option
                        value=""
                        className="bg-background-secondary text-foreground"
                      >
                        Select Material...
                      </option>
                      {MATERIAL_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                          className="bg-background-secondary text-foreground"
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </div>

              <div className="mb-5">
                <label className={labelClass}>
                  <FileText className="w-4 h-4 text-accent-violet" />
                  Description *
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Cement bags for foundation"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelClass}>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-foreground-muted font-bold text-sm">
                        LKR
                      </span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
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
                    <Calendar className="w-4 h-4 text-accent-pink" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Invoice Upload */}
              <div className="mb-8">
                <label className={labelClass}>
                  <Paperclip className="w-4 h-4 text-amber-400" />
                  Invoice (Optional)
                </label>

                {invoice ? (
                  <motion.div
                    className="flex items-center gap-4 p-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div
                      className={`w-11 h-11 flex items-center justify-center rounded-xl shrink-0 text-white shadow-lg ${
                        invoice.type.startsWith("image/")
                          ? "bg-gradient-to-br from-accent-violet to-indigo-600"
                          : "bg-gradient-to-br from-red-500 to-rose-600"
                      }`}
                    >
                      {invoice.type.startsWith("image/") ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-bold text-sm text-foreground">
                        {invoice.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {(invoice.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeInvoice}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                      isDragActive
                        ? "bg-accent-violet/10 border-accent-violet"
                        : "bg-[var(--input-bg)] border-[var(--input-border)] hover:border-foreground-muted hover:bg-[var(--input-focus-bg)]"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload
                      className={`w-10 h-10 mx-auto mb-3 transition-colors ${
                        isDragActive
                          ? "text-accent-violet"
                          : "text-foreground-muted"
                      }`}
                    />
                    <p className="text-sm font-bold text-foreground">
                      {isDragActive
                        ? "Drop the file here"
                        : "Drag & drop invoice"}
                    </p>
                    <p className="text-xs text-foreground-muted mt-1">
                      Image or PDF (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-[var(--input-bg)] text-foreground hover:bg-[var(--input-focus-bg)] border border-[var(--input-border)] font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-accent-violet to-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:from-accent-violet hover:to-indigo-500 transition-all text-sm flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{initialData ? "Save Changes" : "Add Entry"}</span>
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
