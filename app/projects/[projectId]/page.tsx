"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Project,
  BudgetEntry,
  BudgetRelease,
  ProjectCategory,
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
import AddReleaseModal from "@/components/releases/AddReleaseModal";
import ReleaseList from "@/components/releases/ReleaseList";
import ConfirmModal from "@/components/common/ConfirmModal";

import {
  ArrowLeft,
  Plus,
  TrendingDown,
  TrendingUp,
  Receipt,
  Trash2,
  FileText,
  Image as ImageIcon,
  Calendar,
  AlertTriangle,
  Users,
  X,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import ManageCategoriesModal from "@/components/settings/ManageCategoriesModal";

type ViewMode = "expenses" | "releases";

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
  const [releases, setReleases] = useState<BudgetRelease[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive: boolean;
    confirmText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDestructive: false,
  });

  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
    type: "image" | "pdf";
  } | null>(null);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | undefined>(
    undefined
  );
  const [editingRelease, setEditingRelease] = useState<
    BudgetRelease | undefined
  >(undefined);

  // Filters & View State
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("expenses");

  // Pagination for Entries
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageHistory, setPageHistory] = useState<
    ({ date: string; id: string } | undefined)[]
  >([undefined]);

  // Statistics
  const [projectTotalSpent, setProjectTotalSpent] = useState(0);
  const [projectTotalReleased, setProjectTotalReleased] = useState(0);

  // Pagination for Releases
  const [releasesPage, setReleasesPage] = useState(0);
  const releasesPerPage = 10;

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
      // Parallel fetching can be optimized but keeping simple for now
      const projectData = await api.projects.get(projectId);
      setProject(projectData);

      // Fetch Entries
      const cursor = pageHistory[currentPage];
      const entriesData = await api.entries.list(projectId, {
        limit,
        cursor,
      });

      setEntries(entriesData.entries);
      setProjectTotalSpent(entriesData.totalSpent);

      if (entriesData.nextCursor && currentPage === pageHistory.length - 1) {
        setPageHistory((prev) => [...prev, entriesData.nextCursor!]);
      }

      // Fetch Releases
      const releasesData = await api.releases.list(projectId);
      setReleases(releasesData.releases);
      setProjectTotalReleased(releasesData.totalReleased);

      // Fetch Categories
      const categoriesData = await api.categories.list(projectId);
      setCategories(categoriesData);
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
    setConfirmModal({
      isOpen: true,
      title: "Delete Entry",
      message:
        "Are you sure you want to delete this budget entry? This action cannot be undone.",
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.entries.delete(projectId, entryId);
          toast.success("Entry deleted");
          fetchData();
        } catch (error) {
          console.error("Error deleting entry:", error);
          toast.error("Failed to delete entry");
        }
      },
    });
  };

  const handleDeleteRelease = async (releaseId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Release",
      message:
        "Are you sure you want to delete this fund release? This action cannot be undone.",
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.releases.delete(projectId, releaseId);
          toast.success("Release deleted");
          fetchData();
        } catch (error) {
          console.error("Error deleting release:", error);
          toast.error("Failed to delete release");
        }
      },
    });
  };

  if (authLoading || loading) return <PageLoader />;
  if (!project) return null;

  const totalSpent = projectTotalSpent;
  const totalReleased = projectTotalReleased;

  // Estimation Delta
  const remainingEstimation = project.estimatedBudget - totalSpent;
  const isOverBudget = remainingEstimation < 0;

  // Release Delta
  const remainingReleased = totalReleased - totalSpent;
  const isOverReleased = remainingReleased < 0; // Usage exceeds released funds

  const progress =
    project.estimatedBudget > 0
      ? Math.min((totalSpent / project.estimatedBudget) * 100, 100)
      : 0;

  // Percentage of released funds used (relative to total estimation for visual alignment or relative to itself?)
  // Let's show released marker on the progress bar.
  const releasedPercentage =
    project.estimatedBudget > 0
      ? Math.min((totalReleased / project.estimatedBudget) * 100, 100)
      : 0;

  const filteredEntries =
    filterCategory === "all"
      ? entries
      : entries.filter((e) => e.category === filterCategory);

  const getCategoryLabel = (value: string) => {
    const cat = categories.find(
      (c) =>
        c.type === "category" &&
        (c.name === value ||
          c.slug === value ||
          c.name.toLowerCase() === value.toLowerCase())
    );
    return cat ? cat.name : value;
  };

  const getCategoryColor = (value: string) => {
    const cat = categories.find(
      (c) =>
        c.type === "category" &&
        (c.name === value ||
          c.slug === value ||
          c.name.toLowerCase() === value.toLowerCase())
    );
    return cat ? cat.color || "#6B7280" : "#6B7280";
  };

  const getSubCategoryLabel = (value: string) => {
    const sub = categories.find(
      (c) => c.type === "subcategory" && (c.name === value || c.slug === value)
    );
    return sub ? sub.name : value;
  };

  const isOwner = project.userId === user?.uid;
  const currentUserRole: TeamMemberRole = isOwner
    ? "owner"
    : project.teamMembers?.find((m) => m.userId === user?.uid)?.role ||
      "viewer";
  const teamMembers = project.teamMembers || [];

  return (
    <main className="min-h-screen bg-[var(--background)] text-foreground transition-colors duration-300">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 mt-20">
        {/* Header Section */}
        <section>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent">
                  {project.name}
                </h1>
                {isOverBudget && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <AlertTriangle className="w-3 h-3" />
                    Over Budget
                  </span>
                )}
              </div>
              <p className="text-foreground-muted font-medium">
                {project.description || "No description provided"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTeamModal(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-[var(--input-focus-bg)] hover:text-foreground transition-all shadow-sm text-foreground-muted"
              >
                <Users className="w-4 h-4 text-accent-cyan" />
                Team ({teamMembers.length})
              </button>

              <button
                onClick={() => setShowCategoriesModal(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-[var(--input-focus-bg)] hover:text-foreground transition-all shadow-sm text-foreground-muted"
              >
                <LayoutGrid className="w-4 h-4 text-accent-violet" />
                Categories
              </button>

              <button
                onClick={() => setShowReleaseModal(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-[var(--input-focus-bg)] hover:text-foreground transition-all shadow-sm text-foreground-muted"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                Release Funds
              </button>

              <button
                onClick={() => {
                  setEditingEntry(undefined);
                  setShowAddModal(true);
                }}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-accent-violet to-indigo-600 hover:from-accent-violet hover:to-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
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
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
              border: "border-indigo-500/20",
            },
            {
              label: "Funds Released",
              value: formatCurrencyCompact(totalReleased, project.currency),
              fullValue: formatCurrency(totalReleased, project.currency),
              icon: <Wallet className="w-5 h-5" />,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
            },
            {
              label: "Total Spent",
              value: formatCurrencyCompact(totalSpent, project.currency),
              fullValue: formatCurrency(totalSpent, project.currency),
              icon: <TrendingUp className="w-5 h-5" />,
              color: "text-accent-cyan",
              bg: "bg-accent-cyan/10",
              border: "border-accent-cyan/20",
            },
            {
              label: isOverReleased
                ? "Over Released Limit"
                : isOverBudget
                ? "Over Total Budget"
                : "Remaining Released",
              // Logic check: User asked specifically for "how much has left from released amount"
              value: formatCurrencyCompact(
                isOverReleased
                  ? Math.abs(remainingReleased)
                  : remainingReleased,
                project.currency
              ),
              fullValue: formatCurrency(
                Math.abs(remainingReleased),
                project.currency
              ),
              icon: <TrendingDown className="w-5 h-5" />,
              color: isOverReleased ? "text-red-400" : "text-amber-400",
              bg: isOverReleased ? "bg-red-500/10" : "bg-amber-500/10",
              border: isOverReleased
                ? "border-red-500/20"
                : "border-amber-500/20",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl glass-card hover:border-[var(--card-border)] hover:bg-[var(--card)]/80 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl border ${stat.bg} ${stat.color} ${stat.border}`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-black text-foreground"
                    title={stat.fullValue?.toString()}
                  >
                    {isOverReleased && i === 3 ? "+" : ""}
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Improved Progress Card */}
        <section className="p-6 rounded-2xl glass-card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <span className="text-sm font-bold text-foreground-muted">
              Budget Usage vs Released Funds
            </span>
            <div className="text-right text-xs font-medium text-foreground-muted">
              <span className="text-emerald-400 font-bold">
                {formatCurrencyCompact(totalReleased, project.currency)}
              </span>{" "}
              released of{" "}
              <span className="text-indigo-400 font-bold">
                {formatCurrencyCompact(
                  project.estimatedBudget,
                  project.currency
                )}
              </span>{" "}
              total
            </div>
          </div>

          <div className="relative w-full h-4 bg-[var(--input-bg)] rounded-full overflow-hidden border border-[var(--input-border)]">
            {/* Total Released Marker (Background Bar) */}
            <div
              className="absolute top-0 left-0 h-full bg-emerald-500/20 border-r border-emerald-500/50 transition-all duration-1000"
              style={{ width: `${releasedPercentage}%` }}
              title={`Released: ${releasedPercentage.toFixed(1)}%`}
            />

            {/* Spent Progress */}
            <div
              className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] ${
                isOverBudget
                  ? "bg-red-500"
                  : isOverReleased
                  ? "bg-amber-500" // Warning: Spent more than released but under estimation
                  : "bg-emerald-500"
              }`}
              style={{ width: `${progress}%` }}
              title={`Spent: ${progress.toFixed(1)}%`}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs font-medium text-foreground-muted">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Spent (Safe)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>Exceeds Released</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500/30 border border-emerald-500/50"></div>
              <span>Total Released</span>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-card">
            <BudgetOverviewChart
              estimatedBudget={project.estimatedBudget}
              totalSpent={totalSpent}
              currency={project.currency || DEFAULT_CURRENCY}
            />
          </div>
          <div className="p-6 rounded-2xl glass-card">
            <CategoryBreakdownChart
              entries={entries}
              currency={project.currency || DEFAULT_CURRENCY}
              categories={categories}
            />
          </div>
          <div className="lg:col-span-2 p-6 rounded-2xl glass-card">
            <SpendingTimelineChart
              entries={entries}
              estimatedBudget={project.estimatedBudget}
              currency={project.currency || DEFAULT_CURRENCY}
            />
          </div>
        </section>

        {/* Data Section (Tabs) */}
        <section className="p-6 rounded-2xl glass-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode("expenses")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  viewMode === "expenses"
                    ? "bg-accent-violet/10 text-accent-violet border border-accent-violet/20"
                    : "text-foreground-muted hover:bg-[var(--input-bg)] hover:text-foreground"
                }`}
              >
                <Receipt className="w-4 h-4" />
                Expenses Ledger
              </button>
              <button
                onClick={() => setViewMode("releases")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  viewMode === "releases"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "text-foreground-muted hover:bg-[var(--input-bg)] hover:text-foreground"
                }`}
              >
                <Wallet className="w-4 h-4" />
                Funds Released
              </button>
            </div>

            {viewMode === "expenses" && (
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Filters */}
                <div className="flex items-center bg-[var(--input-bg)] rounded-xl border border-[var(--input-border)] px-3 py-2 text-sm">
                  <Calendar className="w-4 h-4 text-foreground-muted mr-2" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-foreground focus:outline-none w-28 placeholder:text-foreground-muted"
                  />
                  <span className="mx-2 text-foreground-muted">→</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-foreground focus:outline-none w-28 placeholder:text-foreground-muted"
                  />
                </div>

                {/* Category Select */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] text-foreground rounded-xl px-4 py-2 text-sm focus:border-accent-violet outline-none"
                >
                  <option
                    value="all"
                    className="bg-background-secondary text-foreground"
                  >
                    All Categories
                  </option>
                  {categories
                    .filter((c) => c.type === "category")
                    .map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.name}
                        className="bg-background-secondary text-foreground"
                      >
                        {cat.name}
                      </option>
                    ))}
                </select>

                {(filterCategory !== "all" || startDate || endDate) && (
                  <button
                    onClick={handleClearFilters}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {viewMode === "expenses" ? (
            // EXPESES TABLE
            <>
              {filteredEntries.length > 0 ? (
                <div className="overflow-x-auto -mx-6">
                  <div className="inline-block min-w-full align-middle px-6">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                      <thead>
                        <tr className="text-left text-xs font-bold text-foreground-muted uppercase tracking-wider">
                          <th className="pb-4 px-4">Date</th>
                          <th className="pb-4 px-4">Category</th>
                          <th className="pb-4 px-4">Description</th>
                          <th className="pb-4 px-4">Amount</th>
                          <th className="pb-4 px-4">Receipt</th>
                          <th className="pb-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--card-border)] text-sm">
                        {filteredEntries.map((entry) => (
                          <tr
                            key={entry.id}
                            className="group hover:bg-[var(--input-bg)]/50 transition-colors"
                          >
                            <td className="py-4 px-4 text-foreground whitespace-nowrap font-medium">
                              {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1.5 align-start">
                                <span
                                  className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight w-fit"
                                  style={{
                                    backgroundColor: `${getCategoryColor(
                                      entry.category
                                    )}15`,
                                    color: getCategoryColor(entry.category),
                                    border: `1px solid ${getCategoryColor(
                                      entry.category
                                    )}30`,
                                  }}
                                >
                                  {getCategoryLabel(entry.category)}
                                </span>
                                {entry.subCategory && (
                                  <span className="text-[10px] text-foreground-muted px-1 font-medium">
                                    {getSubCategoryLabel(entry.subCategory)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-foreground-muted max-w-[200px] truncate">
                              {entry.description}
                            </td>
                            <td className="py-4 px-4 font-bold text-foreground whitespace-nowrap">
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
                                  className="p-2 rounded-lg bg-[var(--input-bg)] text-foreground-muted hover:text-accent-violet hover:bg-[var(--input-focus-bg)] border border-[var(--input-border)] transition-colors"
                                >
                                  {entry.invoiceType === "pdf" ? (
                                    <FileText className="w-4 h-4" />
                                  ) : (
                                    <ImageIcon className="w-4 h-4" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-foreground-muted/30">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditEntry(entry)}
                                  className="p-2 text-foreground-muted hover:text-accent-violet hover:bg-accent-violet/10 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  className="p-2 text-foreground-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-[var(--card-border)]">
                    <div className="flex items-center gap-2 text-sm text-foreground-muted font-medium w-full sm:w-auto justify-center sm:justify-start">
                      <span>Show</span>
                      <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="bg-transparent font-bold focus:outline-none text-foreground cursor-pointer"
                      >
                        <option
                          value={20}
                          className="bg-background-secondary text-foreground"
                        >
                          20
                        </option>
                        <option
                          value={50}
                          className="bg-background-secondary text-foreground"
                        >
                          50
                        </option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                      <button
                        disabled={currentPage === 0}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(0, p - 1))
                        }
                        className="flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] hover:bg-[var(--input-focus-bg)] text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                      </button>
                      <span className="text-sm font-bold text-foreground">
                        Page {currentPage + 1}
                      </span>
                      <button
                        disabled={entries.length < limit}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] hover:bg-[var(--input-focus-bg)] text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-[var(--input-bg)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--input-border)]">
                    <Receipt className="w-8 h-8 text-foreground-muted" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">
                    No entries found
                  </h4>
                  <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                    Start tracking your expenses by adding your first budget
                    entry.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-violet to-indigo-600 text-white font-bold hover:from-accent-violet hover:to-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <Plus className="w-5 h-5" />
                    Add First Entry
                  </button>
                </div>
              )}
            </>
          ) : (
            // RELEASES TABLE
            <ReleaseList
              releases={releases.slice(
                releasesPage * releasesPerPage,
                (releasesPage + 1) * releasesPerPage
              )}
              currency={project.currency}
              currentPage={releasesPage}
              totalPages={Math.ceil(releases.length / releasesPerPage)}
              onPageChange={setReleasesPage}
            />
          )}
        </section>
      </div>

      <TeamManagementModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        projectId={projectId}
        projectName={project.name}
        teamMembers={teamMembers}
        currentUserRole={currentUserRole}
        onUpdate={fetchData}
      />

      <ManageCategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        projectId={projectId}
        onCategoriesUpdated={() => {
          toast.success("Categories updated");
          fetchData();
        }}
      />

      <AddEntryModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        projectId={project.id}
        onEntryAdded={fetchData}
        initialData={editingEntry}
      />

      <AddReleaseModal
        isOpen={showReleaseModal}
        onClose={() => {
          setShowReleaseModal(false);
          setEditingRelease(undefined);
        }}
        projectId={project.id}
        onReleaseAdded={fetchData}
        remainingEstimation={
          project.estimatedBudget -
          releases.reduce((sum, r) => sum + r.amount, 0)
        }
        initialData={editingRelease}
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
      />
    </main>
  );
}
