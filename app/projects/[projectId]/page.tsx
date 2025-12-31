"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Project,
  BudgetEntry,
  BUDGET_CATEGORIES,
  MATERIAL_TYPES,
  TeamMemberRole,
} from "@/types";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

import Navbar from "@/components/common/Navbar";
import { PageLoader } from "@/components/common/LoadingSpinner";
import AddEntryModal from "@/components/entries/AddEntryModal";
import FilePreviewModal from "@/components/common/FilePreviewModal";
import BudgetOverviewChart from "@/components/charts/BudgetOverviewChart";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import SpendingTimelineChart from "@/components/charts/SpendingTimelineChart";
import TeamManagementModal from "@/components/projects/TeamManagementModal";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Receipt,
  Trash2,
  Eye,
  FileText,
  Image as ImageIcon,
  Calendar,
  AlertTriangle,
  Users,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
    type: "image" | "pdf";
  } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | undefined>(
    undefined
  );

  const handleEditEntry = (entry: BudgetEntry) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingEntry(undefined);
  };

  // Fetch project and entries
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      // Parallel fetch could be better but sticking to simple sequence for clarity
      // Actually we need to verify access implicitly via API failure
      const projectData = await api.projects.get(projectId); // Need to implement backend for specific project get or reuse list?
      // Wait, I implemented /api/projects for list, but /api/projects/[projectId] is NOT implmented in backend yet!
      // I implemented /api/projects/[projectId]/team and /api/projects/[projectId]/entries
      // But I missed /api/projects/[projectId] for GET single project details.

      // I need to add that route first or logic will fail.
      // But let's write this frontend assuming I will fix backend immediately after.
      setProject(projectData);

      const entriesData = await api.entries.list(projectId);
      setEntries(entriesData);
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project details");
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  }, [projectId, user, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, authLoading, fetchData, router]);

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await api.entries.delete(projectId, entryId);
      toast.success("Entry deleted");
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  if (authLoading || loading) {
    return <PageLoader />;
  }

  if (!project) {
    return null;
  }

  const totalSpent = entries.reduce(
    (sum, entry) => sum + (entry.amount || 0),
    0
  );
  const remaining = project.estimatedBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const progress =
    project.estimatedBudget > 0
      ? Math.min((totalSpent / project.estimatedBudget) * 100, 100)
      : 0;

  const filteredEntries =
    filterCategory === "all"
      ? entries
      : entries.filter((e) => e.category === filterCategory);

  const getCategoryLabel = (value: string) => {
    return BUDGET_CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  const getCategoryColor = (value: string) => {
    return BUDGET_CATEGORIES.find((c) => c.value === value)?.color || "#6B7280";
  };

  const getSubCategoryLabel = (value: string) => {
    return MATERIAL_TYPES.find((t) => t.value === value)?.label || value;
  };

  // Team management helpers
  const isOwner = project.userId === user?.uid;
  const currentUserRole: TeamMemberRole = isOwner
    ? "owner"
    : project.teamMembers?.find((m) => m.userId === user?.uid)?.role ||
      "viewer";
  const teamMembers = project.teamMembers || [];

  return (
    <div style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
          }}
        />
        <div
          className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
          }}
        />
      </div>

      <Navbar />

      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 24px" }}
      >
        {/* Back Button & Header */}
        <div className="mb-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                {isOverBudget && (
                  <span className="badge badge-error flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Over Budget
                  </span>
                )}
              </div>
              <p className="text-foreground-muted">
                {project.description || "No description"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-2 rounded-xl transition-colors"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "var(--background-secondary)",
                  border: "2px solid var(--border)",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                <Users className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                Team ({teamMembers.length})
              </button>
              <button
                onClick={() => {
                  setEditingEntry(undefined);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 rounded-xl text-white"
                style={{
                  padding: "12px 20px",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  fontSize: "14px",
                  fontWeight: 600,
                  boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
                }}
              >
                <Plus className="w-5 h-5" />
                Add Entry
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid-cols-stats mb-6 mt-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground-muted">
                  Estimated Budget
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(project.estimatedBudget, project.currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-foreground-muted">Total Spent</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalSpent, project.currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${
                  isOverBudget ? "bg-error/10" : "bg-success/10"
                }`}
              >
                <TrendingDown
                  className={`w-6 h-6 ${
                    isOverBudget ? "text-error" : "text-success"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-foreground-muted">
                  {isOverBudget ? "Over Budget" : "Remaining"}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isOverBudget ? "text-error" : "text-success"
                  }`}
                >
                  {isOverBudget ? "+" : ""}
                  {formatCurrency(Math.abs(remaining), project.currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Receipt className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-foreground-muted">Total Entries</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground-muted">
              Budget Progress
            </span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: isOverBudget
                  ? "var(--error)"
                  : progress > 80
                  ? "var(--warning)"
                  : "var(--success)",
              }}
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <BudgetOverviewChart
            estimatedBudget={project.estimatedBudget}
            totalSpent={totalSpent}
          />
          <CategoryBreakdownChart entries={entries} />
        </div>

        <div className="mb-6">
          <SpendingTimelineChart
            entries={entries}
            estimatedBudget={project.estimatedBudget}
          />
        </div>

        {/* Entries Table */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">Budget Entries</h3>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-select w-auto"
            >
              <option value="all">All Categories</option>
              {BUDGET_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {filteredEntries.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Invoice</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-foreground-muted" />
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className="badge"
                            style={{
                              backgroundColor: `${getCategoryColor(
                                entry.category
                              )}20`,
                              color: getCategoryColor(entry.category),
                            }}
                          >
                            {getCategoryLabel(entry.category)}
                          </span>
                          {entry.subCategory && (
                            <span
                              className="text-xs text-foreground-muted px-2 py-0.5 rounded-full bg-background-secondary border border-border"
                              title={getSubCategoryLabel(entry.subCategory)}
                            >
                              {getSubCategoryLabel(entry.subCategory)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="max-w-xs truncate">{entry.description}</td>
                      <td className="font-medium">
                        {formatCurrency(entry.amount, project.currency)}
                      </td>
                      <td>
                        {entry.invoiceUrl ? (
                          <button
                            onClick={() =>
                              setPreviewFile({
                                url: entry.invoiceUrl!,
                                name: entry.invoiceFileName || "Invoice",
                                type: entry.invoiceType || "image",
                              })
                            }
                            className="btn btn-ghost btn-sm p-1"
                            title="View Invoice"
                          >
                            {entry.invoiceType === "pdf" ? (
                              <FileText className="w-4 h-4 text-error" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-primary" />
                            )}
                          </button>
                        ) : (
                          <span className="text-foreground-muted text-sm">
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {entry.invoiceUrl && (
                            <button
                              onClick={() =>
                                setPreviewFile({
                                  url: entry.invoiceUrl!,
                                  name: entry.invoiceFileName || "Invoice",
                                  type: entry.invoiceType || "image",
                                })
                              }
                              className="btn btn-ghost btn-sm p-1"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="btn btn-ghost btn-sm p-1 text-primary"
                            title="Edit"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="btn btn-ghost btn-sm p-1 text-error"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">No entries yet</h4>
              <p className="text-foreground-muted mb-4">
                Start tracking your expenses by adding your first entry
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-accent"
              >
                <Plus className="w-5 h-5" />
                Add First Entry
              </button>
            </div>
          )}
        </div>
      </main>

      <AddEntryModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        projectId={project.id}
        onEntryAdded={fetchData} // Refresh data when entry added
        initialData={editingEntry}
      />

      {previewFile && (
        <FilePreviewModal
          isOpen={true}
          onClose={() => setPreviewFile(null)}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          fileType={previewFile.type}
        />
      )}

      <TeamManagementModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        projectId={project.id}
        projectName={project.name}
        teamMembers={teamMembers}
        currentUserRole={currentUserRole}
        onUpdate={fetchData} // Refresh data when team updated
      />
    </div>
  );
}
