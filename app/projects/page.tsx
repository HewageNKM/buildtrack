"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProjectWithStats, Project } from "@/types";
import { api } from "@/lib/api";
import {
  formatCurrency,
  formatCurrencyCompact,
  DEFAULT_CURRENCY,
} from "@/lib/currency";
import {
  Row,
  Col,
  Input,
  Button,
  Card,
  Statistic,
  Empty,
  Typography,
  Space,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FolderOutlined,
  DollarOutlined,
  RiseOutlined,
  WarningOutlined,
  WalletOutlined,
} from "@ant-design/icons";

import Navbar from "@/components/common/Navbar";
import { PageLoader } from "@/components/common/LoadingSpinner";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import ProjectCard from "@/components/projects/ProjectCard";
// import toast from "react-hot-toast"; // Removed

const { Title, Text } = Typography;

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
      message.error("Failed to load projects");
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
        message.success("Project updated successfully!");
      } else {
        await api.projects.create(projectData);
        message.success("Project created successfully!");
      }
      fetchProjects();
      setShowCreateModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error saving project:", error);
      message.error("Failed to save project");
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowCreateModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.projects.delete(projectId);
      message.success("Project deleted successfully");
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      message.error("Failed to delete project");
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
  const totalReleased = projects.reduce(
    (sum, p) => sum + (p.totalReleased || 0),
    0
  );
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const overBudgetProjects = projects.filter(
    (p) => (p.totalSpent || 0) > (p.estimatedBudget || 0)
  ).length;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <Navbar />

      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "32px 16px",
          marginTop: 80,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
            marginBottom: 48,
          }}
        >
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              My <span style={{ color: "#8b5cf6" }}>Projects</span>
            </Title>
            <Text type="secondary" style={{ fontSize: 16, maxWidth: 500 }}>
              Manage your construction budget, track expenses, and stay in
              control of accurate financial insights.
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
              style={{
                background: "linear-gradient(90deg, #ec4899, #f43f5e)",
                borderColor: "transparent",
              }}
            >
              New Project
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card size="small">
              <Statistic
                title="Active Projects"
                value={activeProjects}
                prefix={<FolderOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={5}>
            <Card size="small">
              <Statistic
                title="Total Budget"
                value={formatCurrencyCompact(totalBudget, DEFAULT_CURRENCY)}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={5}>
            <Card size="small">
              <Statistic
                title="Funds Released"
                value={formatCurrencyCompact(totalReleased, DEFAULT_CURRENCY)}
                prefix={<WalletOutlined />}
                styles={{ content: { color: "#10b981" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={5}>
            <Card size="small">
              <Statistic
                title="Total Spent"
                value={formatCurrencyCompact(totalSpent, DEFAULT_CURRENCY)}
                prefix={<RiseOutlined />}
                styles={{ content: { color: "#06b6d4" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={5}>
            <Card size="small">
              <Statistic
                title="Over Budget"
                value={overBudgetProjects}
                prefix={<WarningOutlined />}
                styles={{
                  content: {
                    color: overBudgetProjects > 0 ? "#f59e0b" : undefined,
                  },
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search */}
        <div style={{ marginBottom: 40, maxWidth: 400 }}>
          <Input
            size="large"
            prefix={<SearchOutlined />}
            placeholder="Search by project name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredProjects.map((project, index) => (
              <Col xs={24} sm={12} lg={8} key={project.id}>
                <ProjectCard
                  project={project}
                  onDelete={handleDeleteProject}
                  onEdit={handleEditProject}
                  index={index}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Card style={{ textAlign: "center", padding: 64 }}>
            <Empty
              image={
                <FolderOutlined style={{ fontSize: 48, color: "#8b5cf6" }} />
              }
              description={
                <Space direction="vertical" size="small">
                  <Text strong style={{ fontSize: 18 }}>
                    {searchQuery ? "No results found" : "No projects yet"}
                  </Text>
                  <Text type="secondary">
                    {searchQuery
                      ? `We couldn't find anything matching "${searchQuery}".`
                      : "Create your first construction project to start tracking."}
                  </Text>
                </Space>
              }
            >
              {!searchQuery && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create First Project
                </Button>
              )}
            </Empty>
          </Card>
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
