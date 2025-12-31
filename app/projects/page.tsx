"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { Project, ProjectWithStats } from "@/types";
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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const projectsQuery = query(
      collection(db, "projects"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      async (snapshot) => {
        const projectsData: ProjectWithStats[] = [];

        for (const projectDoc of snapshot.docs) {
          const project = {
            id: projectDoc.id,
            ...projectDoc.data(),
          } as Project;

          const entriesQuery = query(
            collection(db, "entries"),
            where("projectId", "==", project.id)
          );
          const entriesSnapshot = await getDocs(entriesQuery);
          const totalSpent = entriesSnapshot.docs.reduce((sum, doc) => {
            return sum + (doc.data().amount || 0);
          }, 0);

          projectsData.push({
            ...project,
            totalSpent,
            entryCount: entriesSnapshot.docs.length,
          });
        }

        setProjects(projectsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, router]);

  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    estimatedBudget: number;
    startDate: string;
    endDate?: string;
  }) => {
    if (!user) return;

    await addDoc(collection(db, "projects"), {
      ...projectData,
      userId: user.uid,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    toast.success("Project created successfully!");
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
      const entriesQuery = query(
        collection(db, "entries"),
        where("projectId", "==", projectId)
      );
      const entriesSnapshot = await getDocs(entriesQuery);
      for (const entryDoc of entriesSnapshot.docs) {
        await deleteDoc(doc(db, "entries", entryDoc.id));
      }

      await deleteDoc(doc(db, "projects", projectId));
      toast.success("Project deleted successfully");
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

  const totalBudget = projects.reduce((sum, p) => sum + p.estimatedBudget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.totalSpent || 0), 0);
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const overBudgetProjects = projects.filter(
    (p) => (p.totalSpent || 0) > p.estimatedBudget
  ).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      icon: FolderKanban,
      label: "Active Projects",
      value: activeProjects,
      iconClass: "stat-icon-primary",
    },
    {
      icon: DollarSign,
      label: "Total Budget",
      value: formatCurrency(totalBudget),
      iconClass: "stat-icon-secondary",
    },
    {
      icon: TrendingUp,
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      iconClass: "stat-icon-accent",
    },
    {
      icon: AlertTriangle,
      label: "Over Budget",
      value: overBudgetProjects,
      iconClass:
        overBudgetProjects > 0 ? "stat-icon-danger" : "stat-icon-success",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <Navbar />

      <main className="container py-8">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-1">
              My <span className="text-gradient">Projects</span>
            </h1>
            <p className="text-foreground-muted">
              Manage and track your construction project budgets
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            New Project
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid-cols-stats mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <div className="flex items-center gap-4">
                <div className={`stat-icon ${stat.iconClass}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">{stat.label}</p>
                  <p className="text-2xl font-black">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-12"
              placeholder="Search projects..."
            />
          </div>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid-cols-projects">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="card text-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="stat-icon-primary mx-auto mb-6">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first project to start tracking your budget"}
            </p>
            {!searchQuery && (
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-secondary"
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
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
