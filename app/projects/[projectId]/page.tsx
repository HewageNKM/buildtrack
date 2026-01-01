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
import {
  formatCurrency,
  formatCurrencyCompact,
  DEFAULT_CURRENCY,
} from "@/lib/currency";

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

  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageHistory, setPageHistory] = useState<
    ({ date: string; id: string } | undefined)[]
  >([undefined]);
  const [projectTotalSpent, setProjectTotalSpent] = useState(0);

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
  }, [projectId, user, router, currentPage, limit, pageHistory]);

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
      fetchData();
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  if (authLoading || loading) return <PageLoader />;
  if (!project) return null;

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

  const getCategoryLabel = (value: string) =>
    BUDGET_CATEGORIES.find((c) => c.value === value)?.label || value;

  const getCategoryColor = (value: string) =>
    BUDGET_CATEGORIES.find((c) => c.value === value)?.color || "#6B7280";

  const getSubCategoryLabel = (value: string) =>
    MATERIAL_TYPES.find((t) => t.value === value)?.label || value;

  const isOwner = project.userId === user?.uid;
  const currentUserRole: TeamMemberRole = isOwner
    ? "owner"
    : project.teamMembers?.find((m) => m.userId === user?.uid)?.role ||
      "viewer";
  const teamMembers = project.teamMembers || [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0f0f23] text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* Background Blurs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Header Section */}
        <section>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {project.name}
                </h1>
                {isOverBudget && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    Over Budget
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {project.description || "No description provided"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTeamModal(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <Users className="w-4 h-4 text-violet-500" />
                Team ({teamMembers.length})
              </button>
              <button
                onClick={() => {
                  setEditingEntry(undefined);
                  setShowAddModal(true);
                }}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Estimated Budget",
              value: formatCurrencyCompact(
                project.estimatedBudget,
                project.currency
              ),
              fullValue: formatCurrency(
                project.estimatedBudget,
                project.currency
              ),
              icon: <span className="text-sm font-bold">LKR</span>,
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
            },
            {
              label: "Total Spent",
              value: formatCurrencyCompact(totalSpent, project.currency),
              fullValue: formatCurrency(totalSpent, project.currency),
              icon: <TrendingUp className="w-5 h-5" />,
              color: "text-cyan-500",
              bg: "bg-cyan-500/10",
            },
            {
              label: isOverBudget ? "Over Budget" : "Remaining",
              value: formatCurrencyCompact(
                Math.abs(remaining),
                project.currency
              ),
              fullValue: formatCurrency(Math.abs(remaining), project.currency),
              icon: <TrendingDown className="w-5 h-5" />,
              color: isOverBudget ? "text-red-500" : "text-emerald-500",
              bg: isOverBudget ? "bg-red-500/10" : "bg-emerald-500/10",
            },
            {
              label: "Total Entries",
              value: entries.length,
              icon: <Receipt className="w-5 h-5" />,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-bold"
                    title={stat.fullValue?.toString()}
                  >
                    {isOverBudget && stat.label === "Over Budget" ? "+" : ""}
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Progress Card */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Budget Usage
            </span>
            <span className="text-sm font-bold">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isOverBudget
                  ? "bg-red-500"
                  : progress > 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
            <BudgetOverviewChart
              estimatedBudget={project.estimatedBudget}
              totalSpent={totalSpent}
              currency={project.currency || DEFAULT_CURRENCY}
            />
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CategoryBreakdownChart
              entries={entries}
              currency={project.currency || DEFAULT_CURRENCY}
            />
          </div>
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
            <SpendingTimelineChart
              entries={entries}
              estimatedBudget={project.estimatedBudget}
              currency={project.currency || DEFAULT_CURRENCY}
            />
          </div>
        </section>

        {/* Entries Section */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-bold">Project Ledger</h3>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filters */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
                <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none w-28"
                />
                <span className="mx-2 text-slate-400">→</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none w-28"
                />
              </div>

              {/* Category Select */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">All Categories</option>
                {BUDGET_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {(filterCategory !== "all" || startDate || endDate) && (
                <button
                  onClick={handleClearFilters}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {filteredEntries.length > 0 ? (
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead>
                    <tr className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="pb-4 px-4">Date</th>
                      <th className="pb-4 px-4">Category</th>
                      <th className="pb-4 px-4">Description</th>
                      <th className="pb-4 px-4">Amount</th>
                      <th className="pb-4 px-4">Receipt</th>
                      <th className="pb-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-4 text-sm whitespace-nowrap">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight"
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
                              <span className="text-[10px] text-slate-400 px-1">
                                {getSubCategoryLabel(entry.subCategory)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm max-w-[200px] truncate">
                          {entry.description}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold whitespace-nowrap">
                          {formatCurrencyCompact(
                            entry.amount,
                            project.currency
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {entry.invoiceUrl ? (
                            <button
                              onClick={() =>
                                setPreviewFile({
                                  url: entry.invoiceUrl!,
                                  name: entry.invoiceFileName || "Invoice",
                                  type: entry.invoiceType || "image",
                                })
                              }
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-500 transition-colors"
                            >
                              {entry.invoiceType === "pdf" ? (
                                <FileText className="w-4 h-4" />
                              ) : (
                                <ImageIcon className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Show</span>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-transparent font-bold focus:outline-none"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm font-medium">
                    Page {currentPage + 1}
                  </span>
                  <button
                    disabled={entries.length < limit}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-bold">No entries found</h4>
              <p className="text-slate-500 mb-6">
                Start tracking by adding your first expense.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-5 h-5" />
                Add First Entry
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <AddEntryModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        projectId={project.id}
        onEntryAdded={fetchData}
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
        onUpdate={fetchData}
      />
    </main>
  );
}
