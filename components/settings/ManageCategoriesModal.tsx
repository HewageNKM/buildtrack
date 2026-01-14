"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  FolderOpen,
  LayoutGrid,
} from "lucide-react";
import { ProjectCategory } from "@/types";
import { api } from "@/lib/api";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import toast from "react-hot-toast";

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onCategoriesUpdated: () => void;
}

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  projectId,
  onCategoriesUpdated,
}: ManageCategoriesModalProps) {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingType, setAddingType] = useState<
    "category" | "subcategory" | null
  >(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#3B82F6");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [error, setError] = useState("");

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, projectId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/projects/${projectId}/categories`);
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const payload = {
        name: newCatName,
        type: addingType,
        color: addingType === "category" ? newCatColor : undefined,
        parentId: addingType === "subcategory" ? selectedParentId : undefined,
      };

      await api.post(`/api/projects/${projectId}/categories`, payload);

      toast.success(
        `${addingType === "category" ? "Category" : "Subcategory"} added`
      );
      setAddingType(null);
      setNewCatName("");
      setNewCatColor("#3B82F6");
      setSelectedParentId("");
      fetchCategories();
      onCategoriesUpdated();
    } catch (err) {
      console.error("Failed to add category:", err);
      toast.error("Failed to add category");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await api.delete(`/api/projects/${projectId}/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
      onCategoriesUpdated();
    } catch (err) {
      console.error("Failed to delete category:", err);
      toast.error("Failed to delete category");
    }
  };

  if (!isOpen) return null;

  const mainCategories = categories.filter((c) => c.type === "category");
  const subCategories = categories.filter((c) => c.type === "subcategory");

  // Helper to get subs for a specific parent
  // Note: Migration uses parentName, but new ones might use parentId.
  // We check both for robustness.
  const getSubsForParent = (parent: ProjectCategory) => {
    return subCategories.filter(
      (sub) => sub.parentId === parent.id || sub.parentId === parent.name
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--card)] w-full max-w-2xl rounded-2xl shadow-2xl border border-[var(--card-border)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-accent-violet" />
              Manage Categories
            </h2>
            <p className="text-sm text-foreground-muted mt-1">
              Customize categories for this project
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-foreground-muted hover:text-foreground hover:bg-[var(--input-bg)] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setAddingType("category");
                    setNewCatName("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  <FolderOpen className="w-4 h-4" />
                  Add Main Category
                </button>
                <button
                  onClick={() => {
                    setAddingType("subcategory");
                    setNewCatName("");
                    // Default to first parent
                    if (mainCategories.length > 0)
                      setSelectedParentId(mainCategories[0].id); // or name?
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 text-accent-cyan rounded-lg hover:bg-accent-cyan/20 transition-colors text-sm font-medium"
                >
                  <Tag className="w-4 h-4" />
                  Add Subcategory
                </button>
              </div>

              {/* Add Form */}
              {addingType && (
                <div className="bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--input-border)] animate-in fade-in slide-in-from-top-4">
                  <form onSubmit={handleAdd} className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground">
                      New{" "}
                      {addingType === "category"
                        ? "Main Category"
                        : "Subcategory"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full bg-[var(--card)] border border-[var(--input-border)] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
                        autoFocus
                      />

                      {addingType === "category" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newCatColor}
                            onChange={(e) => setNewCatColor(e.target.value)}
                            className="h-10 w-20 rounded cursor-pointer"
                          />
                          <span className="text-xs text-foreground-muted">
                            Label Color
                          </span>
                        </div>
                      ) : (
                        <select
                          value={selectedParentId}
                          onChange={(e) => setSelectedParentId(e.target.value)}
                          className="w-full bg-[var(--card)] border border-[var(--input-border)] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                          {mainCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAddingType(null)}
                        className="px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Categories List */}
              <div className="space-y-4">
                {mainCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="border border-[var(--card-border)] rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-3 bg-[var(--card-hover)]">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color || "#ccc" }}
                        />
                        <span className="font-medium text-foreground">
                          {cat.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="text-foreground-muted hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subcategories */}
                    <div className="p-3 bg-[var(--card)] space-y-1">
                      {getSubsForParent(cat).length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {getSubsForParent(cat).map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-[var(--input-bg)] text-xs group"
                            >
                              <span className="text-foreground-muted">
                                {sub.name}
                              </span>
                              <button
                                onClick={() => handleDelete(sub.id, sub.name)}
                                className="text-foreground-muted/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-foreground-muted italic px-2">
                          No subcategories
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tag({ className }: { className?: string }) {
  return <FolderOpen className={className} />;
}
