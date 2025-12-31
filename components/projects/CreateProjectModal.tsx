"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  HardHat,
  Calendar,
  AlertCircle,
  Sparkles,
  DollarSign,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: {
    name: string;
    description: string;
    estimatedBudget: number;
    startDate: string;
    endDate?: string;
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

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        startDate,
        endDate: endDate || undefined,
      });

      setName("");
      setDescription("");
      setEstimatedBudget("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate("");
      onClose();
    } catch (err) {
      setError("Failed to create project. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
              maxWidth: "500px",
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
                      "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                    boxShadow: "0 8px 20px rgba(236, 72, 153, 0.3)",
                  }}
                >
                  <HardHat className="w-5 h-5 text-white" />
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
                  New Project
                </h2>
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
                <label style={labelStyle}>Project Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., Office Renovation 2024"
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...inputStyle, minHeight: "100px", resize: "none" }}
                  placeholder="Brief description of the project..."
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Estimated Budget *</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <DollarSign
                      className="w-5 h-5"
                      style={{ color: "var(--foreground-muted)" }}
                    />
                  </div>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "44px" }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div
                className="grid grid-cols-2 gap-4"
                style={{ marginBottom: "24px" }}
              >
                <div>
                  <label className="flex items-center gap-2" style={labelStyle}>
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: "#8b5cf6" }}
                    />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2" style={labelStyle}>
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: "#ec4899" }}
                    />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={inputStyle}
                    min={startDate}
                  />
                </div>
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
                      "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                    fontSize: "15px",
                    fontWeight: 700,
                    boxShadow: "0 8px 25px rgba(236, 72, 153, 0.4)",
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
                      Create Project
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
