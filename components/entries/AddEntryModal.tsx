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
  History,
  Trash2,
  Plus,
} from "lucide-react";
import {
  BUDGET_CATEGORIES,
  BudgetCategory,
  BudgetEntry,
  BudgetEntryItem,
  MATERIAL_TYPES,
  ProjectCategory,
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
  const [items, setItems] = useState<BudgetEntryItem[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState(""); // For versioning
  const [invoice, setInvoice] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamic Categories
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchCategories();
    }
  }, [isOpen, projectId]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await api.get(`/api/projects/${projectId}/categories`);
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      // Fallback is handled by service migration, but if API fails, we might just show empty or alert
      toast.error("Failed to load project categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const mainCategories = categories.filter((c) => c.type === "category");
  const subCategories = categories.filter((c) => c.type === "subcategory");

  const getSubcategories = (parentName: string) => {
    // Find parent ID or check by namne
    const parent = mainCategories.find((c) => c.name === parentName);
    if (!parent) return [];

    return subCategories.filter(
      (s) => s.parentId === parent.id || s.parentId === parent.name
    );
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategory(initialData.category);
        setSubCategory(initialData.subCategory || "");
        setDescription(initialData.description);
        setAmount(initialData.amount.toString());
        setDate(initialData.date.split("T")[0]);
        setItems(initialData.items || []);
      } else {
        // Default to first category if available, else 'materials'
        if (categories.length > 0 && !initialData) {
          const firstCat = categories.find((c) => c.type === "category");
          if (firstCat) setCategory(firstCat.name as BudgetCategory);
        } else if (!initialData) {
          setCategory("materials");
        }

        setSubCategory("");
        setDescription("");
        setAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        setInvoice(null);
        setItems([]);
      }
      setError("");
      setNote("");
    }
  }, [isOpen, initialData, categories]); // Added categories dependency to auto-select

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
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", amount: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    if (newItems.length > 0) {
      const total = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      setAmount(total.toString());
    }
  };

  const updateItem = (
    id: string,
    field: "description" | "amount",
    value: any
  ) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);

    if (field === "amount") {
      const total = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      setAmount(total.toString());
    }
  };

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
        note: initialData ? note : undefined,
        items: items.length > 0 ? items : undefined,
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

              {items.length > 0 ? (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass + " mb-0"}>
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Items Breakdown
                    </label>
                    <span className="text-sm font-bold text-foreground">
                      Total: LKR {parseFloat(amount || "0").toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-3 bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--input-border)]">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(item.id, "description", e.target.value)
                            }
                            className={inputClass + " py-2 text-xs"}
                            required
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount || ""}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "amount",
                                parseFloat(e.target.value)
                              )
                            }
                            className={inputClass + " py-2 text-xs"}
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addItem}
                      className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-accent-violet hover:bg-accent-violet/10 rounded-lg transition-colors border border-dashed border-accent-violet/30"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Item
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs font-semibold text-accent-violet hover:underline"
                  >
                    + Add Itemized List
                  </button>
                </div>
              )}

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
                      className={`${inputClass} pl-12 ${
                        items.length > 0 ? "opacity-70" : ""
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      readOnly={items.length > 0}
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

              {initialData && (
                <div className="mb-6">
                  <label className={labelClass}>
                    <FileText className="w-4 h-4 text-amber-500" />
                    Revision Note (Why are you changing this?)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={inputClass}
                    placeholder="e.g., Price adjustment, Error correction"
                  />
                </div>
              )}

              {initialData &&
                initialData.history &&
                initialData.history.length > 0 && (
                  <div className="mb-8 p-4 bg-[var(--input-bg)] rounded-xl border border-[var(--input-border)]">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                      <History className="w-4 h-4 text-accent-cyan" />
                      Edit History
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {[...initialData.history]
                        .sort(
                          (a, b) =>
                            new Date(b.timestamp).getTime() -
                            new Date(a.timestamp).getTime()
                        )
                        .map((version) => (
                          <div
                            key={version.id}
                            className="text-xs border-l-2 border-[var(--card-border)] pl-3"
                          >
                            <div className="flex justify-between text-foreground-muted mb-1">
                              <span>
                                {new Date(version.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-foreground font-medium">
                              Note: {version.note || "No note"}
                            </p>
                            <div className="mt-1 text-foreground-muted/70">
                              Previous Amount:{" "}
                              {version.snapshot.amount?.toLocaleString()} |
                              Desc: {version.snapshot.description}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

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
                      Image or PDF (Max 5MB)
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
