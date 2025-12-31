"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HardHat, Calendar, AlertCircle, Sparkles } from "lucide-react";
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
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="stat-icon-secondary p-2">
                  <HardHat className="w-5 h-5 text-white" />
                </div>
                <h2 className="modal-title">New Project</h2>
              </div>
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
                <label htmlFor="name" className="form-label">
                  Project Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Office Renovation 2024"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input min-h-[100px] resize-none"
                  placeholder="Brief description of the project..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget" className="form-label">
                  Estimated Budget *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted font-semibold">
                    $
                  </span>
                  <input
                    id="budget"
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    className="form-input pl-8"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label
                    htmlFor="startDate"
                    className="form-label flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-primary" />
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="endDate"
                    className="form-label flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-secondary" />
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                    min={startDate}
                  />
                </div>
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
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
