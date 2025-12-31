"use client";

import { useState, useCallback } from "react";
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
} from "lucide-react";
import { BUDGET_CATEGORIES, BudgetCategory } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: {
    category: BudgetCategory;
    description: string;
    amount: number;
    date: string;
    invoice?: File;
  }) => Promise<void>;
}

export default function AddEntryModal({
  isOpen,
  onClose,
  onSubmit,
}: AddEntryModalProps) {
  const [category, setCategory] = useState<BudgetCategory>("materials");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoice, setInvoice] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      await onSubmit({
        category,
        description: description.trim(),
        amount: parsedAmount,
        date,
        invoice: invoice || undefined,
      });

      setCategory("materials");
      setDescription("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setInvoice(null);
      onClose();
    } catch (err) {
      setError("Failed to add entry. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeInvoice = () => setInvoice(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content max-w-lg"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Add Budget Entry</h2>
              <button onClick={onClose} className="modal-close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  className="flex items-center gap-2 p-4 rounded-xl bg-error-bg text-error text-sm mb-4 border border-error/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as BudgetCategory)
                  }
                  className="form-select"
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description *
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Cement bags for foundation"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted font-semibold">
                      $
                    </span>
                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="form-input pl-8"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label
                    htmlFor="date"
                    className="form-label flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-primary" />
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Invoice Upload */}
              <div className="form-group">
                <label className="form-label">Invoice (Optional)</label>

                {invoice ? (
                  <motion.div
                    className="flex items-center gap-4 p-4 bg-background-secondary rounded-xl border border-border"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div
                      className={`stat-icon ${
                        invoice.type.startsWith("image/")
                          ? "stat-icon-primary"
                          : "stat-icon-danger"
                      } p-2`}
                    >
                      {invoice.type.startsWith("image/") ? (
                        <ImageIcon className="w-5 h-5 text-white" />
                      ) : (
                        <FileText className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{invoice.name}</p>
                      <p className="text-xs text-foreground-muted">
                        {(invoice.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeInvoice}
                      className="btn btn-ghost btn-sm p-1 text-error"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`dropzone ${
                      isDragActive ? "dropzone-active" : ""
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-10 h-10 text-foreground-muted mx-auto mb-3" />
                    <p className="text-foreground-muted font-medium">
                      {isDragActive
                        ? "Drop the file here..."
                        : "Drag & drop an image or PDF"}
                    </p>
                    <p className="text-xs text-foreground-muted mt-1">
                      or click to select (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Add Entry
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
