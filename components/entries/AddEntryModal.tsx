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
  DollarSign,
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

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  backgroundColor: "var(--background-secondary)",
  border: "2px solid transparent",
  borderRadius: "12px",
  fontSize: "15px",
  color: "var(--foreground)",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: 600,
  marginBottom: "8px",
  color: "var(--foreground)",
};

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
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            padding: "24px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full rounded-3xl"
            style={{
              maxWidth: "520px",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between"
              style={{
                padding: "24px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: "44px",
                    height: "44px",
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Add Entry</h2>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-xl transition-colors"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "var(--background-secondary)",
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              {error && (
                <motion.div
                  className="flex items-center gap-3 rounded-xl"
                  style={{
                    padding: "14px",
                    marginBottom: "20px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    fontSize: "14px",
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Category</label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as BudgetCategory)
                  }
                  style={inputStyle}
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Description *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., Cement bags for foundation"
                  required
                />
              </div>

              <div
                className="grid grid-cols-2 gap-4"
                style={{ marginBottom: "20px" }}
              >
                <div>
                  <label style={labelStyle}>Amount *</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <DollarSign
                        className="w-5 h-5"
                        style={{ color: "var(--foreground-muted)" }}
                      />
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: "44px" }}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2" style={labelStyle}>
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: "#8b5cf6" }}
                    />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Invoice Upload */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Invoice (Optional)</label>

                {invoice ? (
                  <motion.div
                    className="flex items-center gap-4 rounded-xl"
                    style={{
                      padding: "16px",
                      backgroundColor: "var(--background-secondary)",
                      border: "1px solid var(--border)",
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div
                      className="flex items-center justify-center rounded-xl shrink-0"
                      style={{
                        width: "44px",
                        height: "44px",
                        background: invoice.type.startsWith("image/")
                          ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                          : "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
                      }}
                    >
                      {invoice.type.startsWith("image/") ? (
                        <ImageIcon className="w-5 h-5 text-white" />
                      ) : (
                        <FileText className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate"
                        style={{ fontWeight: 600, fontSize: "14px" }}
                      >
                        {invoice.name}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--foreground-muted)",
                        }}
                      >
                        {(invoice.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeInvoice}
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                      }}
                    >
                      <X className="w-4 h-4" style={{ color: "#ef4444" }} />
                    </button>
                  </motion.div>
                ) : (
                  <div
                    {...getRootProps()}
                    className="rounded-xl text-center cursor-pointer transition-colors"
                    style={{
                      padding: "32px",
                      border: "2px dashed var(--border)",
                      backgroundColor: isDragActive
                        ? "var(--background-secondary)"
                        : "transparent",
                    }}
                  >
                    <input {...getInputProps()} />
                    <Upload
                      className="w-10 h-10 mx-auto"
                      style={{
                        color: "var(--foreground-muted)",
                        marginBottom: "12px",
                      }}
                    />
                    <p
                      style={{
                        color: "var(--foreground-muted)",
                        fontWeight: 500,
                        fontSize: "14px",
                      }}
                    >
                      {isDragActive
                        ? "Drop the file here..."
                        : "Drag & drop an image or PDF"}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--foreground-muted)",
                        marginTop: "4px",
                      }}
                    >
                      or click to select (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center rounded-xl transition-colors"
                  style={{
                    padding: "14px",
                    backgroundColor: "var(--background-secondary)",
                    border: "2px solid var(--border)",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl text-white"
                  style={{
                    padding: "14px",
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    fontSize: "15px",
                    fontWeight: 700,
                    boxShadow: "0 8px 25px rgba(139, 92, 246, 0.4)",
                    opacity: loading ? 0.7 : 1,
                  }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
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
