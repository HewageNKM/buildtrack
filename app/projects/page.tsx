"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ProjectWithStats, CurrencyCode, Project } from "@/types";
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
    if (
      !confirm(
        "Are you sure you want to delete this project? This will also delete all associated entries."
      )
    ) {
      return;
    }

    try {
      await api.projects.delete(projectId);
      toast.success("Project deleted successfully");
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  if (authLoading || loading) {
    return <PageLoader />;
  }

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
      color: "#8b5cf6",
    },
    {
      icon: DollarSign,
      label: "Total Budget",
      value: formatCurrencyCompact(totalBudget, DEFAULT_CURRENCY),
      fullValue: formatCurrency(totalBudget, DEFAULT_CURRENCY),
      color: "#ec4899",
    },
    {
      icon: TrendingUp,
      label: "Total Spent",
      value: formatCurrencyCompact(totalSpent, DEFAULT_CURRENCY),
      fullValue: formatCurrency(totalSpent, DEFAULT_CURRENCY),
      color: "#06b6d4",
    },
    {
      icon: AlertTriangle,
      label: "Over Budget",
      value: overBudgetProjects,
      fullValue: overBudgetProjects.toString(),
      color: overBudgetProjects > 0 ? "#ef4444" : "#10b981",
    },
  ];

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
        className="container"
        style={{ paddingTop: "40px", paddingBottom: "40px" }}
      >
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ marginBottom: "40px" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1
              style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px" }}
            >
              My <span className="text-gradient">Projects</span>
            </h1>
            <p style={{ color: "var(--foreground-muted)", fontSize: "16px" }}>
              Manage and track your construction project budgets
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl text-white"
            style={{
              padding: "14px 24px",
              background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
              fontSize: "15px",
              fontWeight: 700,
              boxShadow: "0 8px 25px rgba(236, 72, 153, 0.4)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            New Project
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          style={{ marginBottom: "40px" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl w-full"
              style={{
                padding: "24px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{
                    width: "52px",
                    height: "52px",
                    background:
                      stat.label === "Total Budget"
                        ? "rgba(129, 140, 248, 0.15)"
                        : `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}aa 100%)`,
                    boxShadow:
                      stat.label === "Total Budget"
                        ? "none"
                        : `0 8px 20px ${stat.color}35`,
                  }}
                >
                  {stat.label === "Total Budget" ? (
                    <span className="text-primary font-bold text-sm">LKR</span>
                  ) : (
                    <stat.icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--foreground-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="wrap-break-word"
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      lineHeight: "1.2",
                    }}
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
          style={{ marginBottom: "32px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative" style={{ maxWidth: "400px" }}>
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--foreground-muted)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl"
              style={{
                padding: "14px 14px 14px 48px",
                backgroundColor: "var(--background-secondary)",
                border: "2px solid var(--border)",
                fontSize: "15px",
                color: "var(--foreground)",
              }}
              placeholder="Search projects..."
            />
          </div>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            className="rounded-3xl text-center"
            style={{
              padding: "80px 32px",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className="flex items-center justify-center rounded-2xl mx-auto"
              style={{
                width: "72px",
                height: "72px",
                marginBottom: "24px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                boxShadow: "0 12px 35px rgba(139, 92, 246, 0.4)",
              }}
            >
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p
              style={{
                color: "var(--foreground-muted)",
                marginBottom: "28px",
                maxWidth: "360px",
                margin: "0 auto 28px",
              }}
            >
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first project to start tracking your budget"}
            </p>
            {!searchQuery && (
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-xl text-white"
                style={{
                  padding: "16px 28px",
                  background:
                    "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                  fontSize: "15px",
                  fontWeight: 700,
                  boxShadow: "0 8px 25px rgba(236, 72, 153, 0.4)",
                }}
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
