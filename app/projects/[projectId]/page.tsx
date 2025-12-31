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
import { formatCurrency, formatCurrencyCompact } from "@/lib/currency";

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
  X,
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

  // Pagination State
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageHistory, setPageHistory] = useState<
    ({ date: string; id: string } | undefined)[]
  >([undefined]);
  const [projectTotalSpent, setProjectTotalSpent] = useState(0);

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleClearFilters = () => {
    setFilterCategory("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(0);
    setPageHistory([undefined]);
  };

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
      const projectData = await api.projects.get(projectId);
      setProject(projectData);

      const cursor = pageHistory[currentPage];
      const data = await api.entries.list(projectId, {
        limit,
        cursor,
      });

      setEntries(data.entries);
      setProjectTotalSpent(data.totalSpent);

      // Update history if we have a next cursor and we are at the end of known history
      if (data.nextCursor && currentPage === pageHistory.length - 1) {
        setPageHistory((prev) => [...prev, data.nextCursor!]);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project details");
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  }, [projectId, user, router, currentPage, limit, pageHistory]); // Added dependencies

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, authLoading, fetchData, router]); // fetchData dependency handles updates

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await api.entries.delete(projectId, entryId);
      toast.success("Entry deleted");
      fetchData(); // Refresh to update list and totals
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

  // Use the total fetched from backend instead of reducing current page entries
  const totalSpent = projectTotalSpent;
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
    <main className="container py-8 space-y-8">
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
        className="container"
        style={{ paddingBottom: "2rem", paddingTop: "2rem" }}
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
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowTeamModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl transition-colors flex-1 md:flex-none"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "var(--background-secondary)",
                  border: "2px solid var(--border)",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                <Users className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                <span>Team ({teamMembers.length})</span>
              </button>
              <button
                onClick={() => {
                  setEditingEntry(undefined);
                  setShowAddModal(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl text-white flex-1 md:flex-none"
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
                <span>Add Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid-cols-stats mb-6 mt-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
                <span className="text-primary font-bold text-sm">LKR</span>
              </div>
              <div>
                <p className="text-sm text-foreground-muted">
                  Estimated Budget
                </p>
                <p
                  className="text-2xl font-bold"
                  title={formatCurrency(
                    project.estimatedBudget,
                    project.currency
                  )}
                >
                  {formatCurrencyCompact(
                    project.estimatedBudget,
                    project.currency
                  )}
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
                <p
                  className="text-2xl font-bold"
                  title={formatCurrency(totalSpent, project.currency)}
                >
                  {formatCurrencyCompact(totalSpent, project.currency)}
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
                  className="text-2xl font-bold"
                  title={formatCurrency(Math.abs(remaining), project.currency)}
                >
                  {isOverBudget ? "+" : ""}
                  {formatCurrencyCompact(Math.abs(remaining), project.currency)}
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
            currency={project.currency}
          />
          <CategoryBreakdownChart
            entries={entries}
            currency={project.currency}
          />
        </div>

        <div className="mb-6">
          <SpendingTimelineChart
            entries={entries}
            estimatedBudget={project.estimatedBudget}
            currency={project.currency}
          />
        </div>

        {/* Entries Table */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">Budget Entries</h3>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Date Filter Group */}
              <div className="flex items-center bg-background-secondary rounded-lg border border-border px-3 py-1.5 shadow-sm">
                <Calendar className="w-4 h-4 text-foreground-muted mr-2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(0);
                    setPageHistory([undefined]);
                  }}
                  className="bg-transparent text-sm border-none focus:ring-0 p-0 w-28 text-foreground placeholder-foreground-muted appearance-none [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                  placeholder="Start"
                  aria-label="Start Date"
                />
                <span className="text-foreground-muted mx-2">→</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(0);
                    setPageHistory([undefined]);
                  }}
                  className="bg-transparent text-sm border-none focus:ring-0 p-0 w-28 text-foreground placeholder-foreground-muted appearance-none [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
                  placeholder="End"
                  aria-label="End Date"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="form-select pl-3 pr-8 py-1.5 text-sm bg-background-secondary border-border rounded-lg shadow-sm focus:border-accent focus:ring-accent"
                >
                  <option value="all">All Categories</option>
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filter Button */}
              {(filterCategory !== "all" || startDate || endDate) && (
                <button
                  onClick={handleClearFilters}
                  className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                  title="Clear All Filters"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {filteredEntries.length > 0 ? (
            <>
              <div className="table-container">
                <table className="table">
                  {/* ... existing table header ... */}
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
                        {/* ... existing rows ... */}
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
                        <td className="max-w-xs truncate">
                          {entry.description}
                        </td>
                        <td
                          className="font-medium"
                          title={formatCurrency(entry.amount, project.currency)}
                        >
                          {formatCurrencyCompact(
                            entry.amount,
                            project.currency
                          )}
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

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4 px-2 border-t border-border pt-4 flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-background-secondary rounded-md px-2 py-1">
                  <span className="text-sm text-foreground-muted whitespace-nowrap">
                    Rows:
                  </span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(0);
                      setPageHistory([undefined]);
                    }}
                    className="bg-transparent border-none text-sm focus:ring-0 p-0 cursor-pointer"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(0, p - 1));
                    }}
                    disabled={currentPage === 0}
                    className="btn btn-outline btn-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  <span className="text-sm text-foreground-muted mx-2">
                    Page {currentPage + 1}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => p + 1);
                    }}
                    disabled={entries.length < limit}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                    <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                  </button>
                </div>
              </div>
            </>
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
    </main>
  );
}
