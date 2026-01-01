"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ProjectWithStats, Project } from "@/types";
import { api } from "@/lib/api";
import {
  formatCurrency,
  formatCurrencyCompact,
  DEFAULT_CURRENCY,
} from "@/lib/currency";

import Navbar from "@/components/common/Navbar";
import { PageLoader } from "@/components/common/LoadingSpinner";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import ProjectCard from "@/components/projects/ProjectCard";
import {
  Plus,
  FolderKanban,
  Search,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.projects.list();
      setProjects(data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchProjects();
  }, [user, authLoading, router]);

  const handleCreateOrUpdateProject = async (projectData: any) => {
    try {
      if (editingProject) {
        await api.projects.update(editingProject.id, projectData);
        toast.success("Project updated successfully!");
      } else {
        await api.projects.create(projectData);
        toast.success("Project created successfully!");
      }
      fetchProjects();
      setShowCreateModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowCreateModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await api.projects.delete(projectId);
      toast.success("Project deleted successfully");
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  if (authLoading || loading) return <PageLoader />;

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBudget = projects.reduce(
    (sum, p) => sum + (p.estimatedBudget || 0),
    0
  );
  const totalSpent = projects.reduce((sum, p) => sum + (p.totalSpent || 0), 0);
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const overBudgetProjects = projects.filter(
    (p) => (p.totalSpent || 0) > (p.estimatedBudget || 0)
  ).length;

  const stats = [
    {
      icon: FolderKanban,
      label: "Active Projects",
      value: activeProjects,
      fullValue: activeProjects.toString(),
      colorClass: "from-accent-violet to-primary",
      shadowClass: "shadow-accent-violet/20",
    },
    {
      icon: DollarSign,
      label: "Total Budget",
      value: formatCurrencyCompact(totalBudget, DEFAULT_CURRENCY),
      fullValue: formatCurrency(totalBudget, DEFAULT_CURRENCY),
      colorClass: "from-accent-pink to-rose-400",
      shadowClass: "shadow-accent-pink/20",
    },
    {
      icon: TrendingUp,
      label: "Total Spent",
      value: formatCurrencyCompact(totalSpent, DEFAULT_CURRENCY),
      fullValue: formatCurrency(totalSpent, DEFAULT_CURRENCY),
      colorClass: "from-accent-cyan to-blue-500",
      shadowClass: "shadow-accent-cyan/20",
    },
    {
      icon: AlertTriangle,
      label: "Over Budget",
      value: overBudgetProjects,
      fullValue: overBudgetProjects.toString(),
      colorClass:
        overBudgetProjects > 0
          ? "from-amber-400 to-orange-500"
          : "from-emerald-400 to-teal-500",
      shadowClass:
        overBudgetProjects > 0
          ? "shadow-amber-400/20"
          : "shadow-emerald-400/20",
    },
  ];

  return (
    <div className="min-h-screen text-foreground pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-7xl mt-20">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
              My <span className="text-gradient">Projects</span>
            </h1>
            <p className="text-foreground-muted text-lg max-w-xl">
              Manage your construction budget, track expenses, and stay in
              control of accurate financial insights.
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-accent-pink to-rose-500 hover:from-accent-pink hover:to-rose-400 shadow-[0_4px_20px_rgba(236,72,153,0.4)] hover:shadow-[0_6px_25px_rgba(236,72,153,0.5)] transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            New Project
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-card p-6 rounded-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-2xl shrink-0 bg-gradient-to-br ${stat.colorClass} shadow-lg ${stat.shadowClass}`}
                >
                  {stat.label === "Total Budget" ? (
                    <span className="text-white font-bold text-sm">LKR</span>
                  ) : (
                    <stat.icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-black tracking-tight text-foreground truncate"
                    title={stat.fullValue}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          className="mb-10 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted group-focus-within:text-accent-violet transition-colors duration-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-accent-violet/50 focus:bg-[var(--input-focus-bg)] outline-none transition-all text-foreground placeholder:text-foreground-muted/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              placeholder="Search by project name or description..."
            />
          </div>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onEdit={handleEditProject}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="py-24 px-6 rounded-3xl glass-card text-center flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 mb-8 flex items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
              <FolderKanban className="w-10 h-10 text-foreground-muted" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              {searchQuery ? "No results found" : "No projects yet"}
            </h3>
            <p className="text-foreground-muted mb-8 max-w-sm mx-auto text-base leading-relaxed">
              {searchQuery
                ? `We couldn't find anything matching "${searchQuery}". Try a different search term.`
                : "Create your first construction project to start tracking your budget and expenses efficiently."}
            </p>
            {!searchQuery && (
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-violet to-primary text-white font-bold shadow-lg shadow-accent-violet/25 hover:shadow-accent-violet/40 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                Create First Project
              </motion.button>
            )}
          </motion.div>
        )}
      </main>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProject(null);
        }}
        onSubmit={handleCreateOrUpdateProject}
        initialData={editingProject || undefined}
      />
    </div>
  );
}
