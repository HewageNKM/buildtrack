"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Project, BudgetEntry, BudgetRelease, ProjectCategory } from "@/types";
import { api } from "@/lib/api";
import { formatCurrencyCompact, DEFAULT_CURRENCY } from "@/lib/currency";

import Navbar from "@/components/common/Navbar";
import { PageLoader } from "@/components/common/LoadingSpinner";
import AddEntryModal from "@/components/entries/AddEntryModal";
import BudgetOverviewChart from "@/components/charts/BudgetOverviewChart";
import CategoryBreakdownChart from "@/components/charts/CategoryBreakdownChart";
import SpendingTimelineChart from "@/components/charts/SpendingTimelineChart";
import TeamManagementModal from "@/components/projects/TeamManagementModal";
import AddReleaseModal from "@/components/releases/AddReleaseModal";
import ReleaseList from "@/components/releases/ReleaseList";
import ManageCategoriesModal from "@/components/settings/ManageCategoriesModal";
import ViewEntryModal from "@/components/entries/ViewEntryModal";
import ViewReleaseModal from "@/components/releases/ViewReleaseModal";
import ReportsTab from "@/components/reports/ReportsTab";
import ManageVendorsModal from "@/components/settings/ManageVendorsModal";
import ManagePhasesModal from "@/components/settings/ManagePhasesModal";

import {
  ArrowLeftOutlined,
  PlusOutlined,
  TeamOutlined,
  AppstoreOutlined,
  WalletOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FileImageOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
  ClearOutlined,
  EyeOutlined,
  DownloadOutlined,
  BarChartOutlined,
  ShopOutlined,
  FlagOutlined,
} from "@ant-design/icons";

import {
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tabs,
  Table,
  Tag,
  Space,
  Tooltip,
  Modal,
  Typography,
  Select,
  DatePicker,
  message,
  Layout,
  Image,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import dayjs from "dayjs";

import { AnalyticsData } from "@/services/ReportsService";
const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [releases, setReleases] = useState<BudgetRelease[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showVendorsModal, setShowVendorsModal] = useState(false);
  const [showPhasesModal, setShowPhasesModal] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | undefined>(
    undefined,
  );

  const [editingRelease, setEditingRelease] = useState<
    BudgetRelease | undefined
  >(undefined);

  const [viewingEntry, setViewingEntry] = useState<BudgetEntry | null>(null);
  const [viewingRelease, setViewingRelease] = useState<BudgetRelease | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<string>("expenses");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [pageHistory, setPageHistory] = useState<
    ({ date: string; id: string } | undefined)[]
  >([undefined]);
  const [limit] = useState(20);
  const currentPage = pagination.current - 1;

  const [releasesPage, setReleasesPage] = useState(1);

  const [projectTotalSpent, setProjectTotalSpent] = useState(0);
  const [projectTotalReleased, setProjectTotalReleased] = useState(0);

  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);

  const handleClearFilters = () => {
    setFilterCategory("all");
    setDateRange([null, null]);
    setPagination({ ...pagination, current: 1 });
    setPageHistory([undefined]);
  };

  const handleEditEntry = (entry: BudgetEntry) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleViewEntry = (entry: BudgetEntry) => {
    setViewingEntry(entry);
  };

  const handleViewRelease = (release: BudgetRelease) => {
    setViewingRelease(release);
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const projectData = await api.projects.get(projectId);
      setProject(projectData);

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

      const releasesData = await api.releases.list(projectId);
      setReleases(releasesData.releases);
      setProjectTotalReleased(releasesData.totalReleased);

      const categoriesData = await api.categories.list(projectId);
      setCategories(categoriesData);

      // Fetch aggregated analytics data for dashboard charts
      const analyticsInfo = await api.analytics.getAnalyticsData(projectId);
      setAnalyticsData(analyticsInfo);
    } catch (error) {
      console.error("Error fetching project data:", error);
      message.error("Failed to load project details");
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
    Modal.confirm({
      title: "Delete Entry",
      content:
        "Are you sure you want to delete this budget entry? This action cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.entries.delete(projectId, entryId);
          message.success("Entry deleted");
          fetchData();
        } catch (error) {
          console.error("Error deleting entry:", error);
          message.error("Failed to delete entry");
        }
      },
    });
  };

  const handleDeleteRelease = async (releaseId: string) => {
    try {
      await api.releases.delete(projectId, releaseId);
      message.success("Release deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting release:", error);
      message.error("Failed to delete release");
    }
  };

  if (authLoading || loading) return <PageLoader />;
  if (!project) return null;

  const totalSpent = projectTotalSpent;
  const totalReleased = projectTotalReleased;

  const widthPercentage = (val: number, max: number) =>
    max > 0 ? Math.min((val / max) * 100, 100) : 0;

  const releasedPercentage = widthPercentage(
    totalReleased,
    project.estimatedBudget,
  );
  const spentPercentage = widthPercentage(totalSpent, project.estimatedBudget);

  const isOverBudget = totalSpent > project.estimatedBudget;
  const isOverReleased = totalSpent > totalReleased;

  const filteredEntries = entries.filter((e) => {
    if (filterCategory !== "all") {
      // Check if ANY item matches the filtered category
      const hasCategory = (e.items || []).some(
        (item) => item.category === filterCategory,
      );
      if (!hasCategory) return false;
    }
    if (dateRange[0] && dayjs(e.date).isBefore(dateRange[0], "day"))
      return false;
    if (dateRange[1] && dayjs(e.date).isAfter(dateRange[1], "day"))
      return false;
    return true;
  });

  const getCategoryColor = (value: string) => {
    const cat = categories.find(
      (c) =>
        c.type === "category" &&
        (c.name === value ||
          c.slug === value ||
          c.name.toLowerCase() === value.toLowerCase()),
    );
    return cat ? cat.color || "#8b5cf6" : "#8b5cf6";
  };

  const entryColumns: ColumnsType<BudgetEntry> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => dayjs(date).format("MMM D, YYYY"),
    },
    {
      title: "Category",
      key: "category",
      width: 150,
      render: (_, record) => {
        // Fallback or multi-item logic
        const items = record.items || [];
        if (items.length > 1) {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Tag
                color="default"
                style={{ marginRight: 0, width: "fit-content" }}
              >
                Multiple Items ({items.length})
              </Tag>
            </div>
          );
        }

        const item = items[0] || record; // Fallback to root for legacy if array empty
        // However, item might be just { description, amount, category } structure
        // We need to fetch color for item.category

        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Tag
              color={getCategoryColor(item.category || "")}
              style={{ marginRight: 0, width: "fit-content" }}
            >
              {item.category
                ?.split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </Tag>
            {item.subCategory && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {item.subCategory
                  .split(" ")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Items",
      key: "description",
      ellipsis: true,
      render: (_, record) => {
        const items = record.items || [];
        if (items.length === 0) return <Text type="secondary">-</Text>;

        const firstItem = items[0];
        const description = firstItem.description
          ?.split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        if (items.length === 1) {
          return <Text>{description}</Text>;
        }

        return (
          <Space size={4}>
            <Text>{description}</Text>
            <Tag color="blue" style={{ marginLeft: 4 }}>
              +{items.length - 1} more
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 120,
      render: (amount) => (
        <Text strong>{formatCurrencyCompact(amount, project.currency)}</Text>
      ),
    },
    {
      title: "Invoice",
      key: "receipt",
      align: "center",
      width: 100,
      render: (_, record) =>
        record.invoiceUrl ? (
          <Space>
            <Tooltip title="Preview">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => {
                  if (
                    record.invoiceType === "pdf" ||
                    record.invoiceUrl?.endsWith(".pdf")
                  ) {
                    window.open(record.invoiceUrl, "_blank");
                  } else {
                    setPreviewImage(record.invoiceUrl!);
                  }
                }}
              />
            </Tooltip>
            <Tooltip title="Download">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => {
                  // Direct navigation downloads the file
                  window.location.href = record.invoiceUrl!;
                }}
              />
            </Tooltip>
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewEntry(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditEntry(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteEntry(record.id)}
          />
        </Space>
      ),
    },
  ];

  const teamMembers = project.teamMembers || [];

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Navbar />

      <Content
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 24px 24px",
          width: "100%",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            href="/projects"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              color: "var(--foreground-muted)",
            }}
          >
            <ArrowLeftOutlined /> Back to Projects
          </Link>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <Title
                level={2}
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {project.name}
                {isOverBudget && (
                  <Tag color="error" icon={<WarningOutlined />}>
                    Over Budget
                  </Tag>
                )}
              </Title>
              <Text type="secondary">
                {project.description || "No description provided"}
              </Text>
            </div>

            <Space wrap>
              <Button
                icon={<TeamOutlined />}
                onClick={() => setShowTeamModal(true)}
              >
                Team ({teamMembers.length})
              </Button>
              <Button
                icon={<AppstoreOutlined />}
                onClick={() => setShowCategoriesModal(true)}
              >
                Categories
              </Button>
              <Button
                icon={<ShopOutlined />}
                onClick={() => setShowVendorsModal(true)}
              >
                Vendors
              </Button>
              <Button
                icon={<FlagOutlined />}
                onClick={() => setShowPhasesModal(true)}
              >
                Phases
              </Button>
              <Button
                icon={<WalletOutlined />}
                onClick={() => setShowReleaseModal(true)}
              >
                Release Funds
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingEntry(undefined);
                  setShowAddModal(true);
                }}
                style={{
                  background: "linear-gradient(90deg, #8b5cf6, #6366f1)",
                }}
              >
                Add Entry
              </Button>
            </Space>
          </div>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            {/* Replaced bordered={false} with variant="borderless" */}
            <Card variant="borderless" className="shadow-sm">
              <Statistic
                title="Estimated Budget"
                value={formatCurrencyCompact(
                  project.estimatedBudget,
                  project.currency,
                )}
                prefix={
                  <span style={{ fontWeight: "bold", fontSize: 14 }}>LKR</span>
                }
                // Updated valueStyle to styles={{ content: ... }}
                styles={{ content: { color: "#6366f1", fontWeight: "bold" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="shadow-sm">
              <Statistic
                title="Funds Released"
                value={formatCurrencyCompact(totalReleased, project.currency)}
                prefix={<WalletOutlined />}
                styles={{ content: { color: "#10b981", fontWeight: "bold" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="shadow-sm">
              <Statistic
                title="Total Spent"
                value={formatCurrencyCompact(totalSpent, project.currency)}
                prefix={<RiseOutlined />}
                styles={{ content: { color: "#06b6d4", fontWeight: "bold" } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" className="shadow-sm">
              <Statistic
                title={
                  isOverReleased ? "Over Released Limit" : "Remaining Released"
                }
                value={formatCurrencyCompact(
                  Math.abs(totalReleased - totalSpent),
                  project.currency,
                )}
                prefix={isOverReleased ? <FallOutlined /> : <WalletOutlined />}
                styles={{
                  content: {
                    color: isOverReleased ? "#ef4444" : "#f59e0b",
                    fontWeight: "bold",
                  },
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress Bar Card */}
        <Card
          style={{ marginBottom: 24 }}
          variant="borderless"
          className="shadow-sm"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text strong>Budget Usage vs Released Funds</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <Text strong style={{ color: "#10b981" }}>
                {formatCurrencyCompact(totalReleased, project.currency)}
              </Text>{" "}
              released of{" "}
              <Text strong style={{ color: "#6366f1" }}>
                {formatCurrencyCompact(
                  project.estimatedBudget,
                  project.currency,
                )}
              </Text>
            </Text>
          </div>
          <Tooltip
            title={`Spent: ${spentPercentage.toFixed(
              1,
            )}% | Released: ${releasedPercentage.toFixed(1)}%`}
          >
            <Progress
              percent={spentPercentage}
              success={{ percent: releasedPercentage, strokeColor: "#10b981" }}
              strokeColor={
                isOverBudget
                  ? "#ef4444"
                  : isOverReleased
                    ? "#f59e0b"
                    : "#6366f1"
              }
              showInfo={false}
              // Updated strokeWidth to size={{ height: 12 }}
              size={{ height: 12 }}
            />
          </Tooltip>
          <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
            <Space size={4}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#6366f1",
                }}
              />{" "}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Spent
              </Text>
            </Space>
            <Space size={4}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />{" "}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Released
              </Text>
            </Space>
            {isOverReleased && (
              <Space size={4}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#f59e0b",
                  }}
                />{" "}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Exceeds Released
                </Text>
              </Space>
            )}
          </div>
        </Card>

        {/* Charts */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <BudgetOverviewChart
              estimatedBudget={project.estimatedBudget}
              totalSpent={totalSpent}
              currency={project.currency || DEFAULT_CURRENCY}
            />
          </Col>
          <Col xs={24} lg={12}>
            {analyticsData && (
              <CategoryBreakdownChart
                data={analyticsData.categoryBreakdown}
                currency={project.currency || DEFAULT_CURRENCY}
              />
            )}
          </Col>
          <Col span={24}>
            {analyticsData && (
              <SpendingTimelineChart
                data={analyticsData.timeline}
                estimatedBudget={project.estimatedBudget}
                currency={project.currency || DEFAULT_CURRENCY}
              />
            )}
          </Col>
        </Row>

        {/* Tabs for Expenses / Releases */}
        <Card variant="borderless" className="shadow-sm">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "expenses",
                label: (
                  <span>
                    <FileTextOutlined /> Expenses Ledger
                  </span>
                ),
                children: (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <Space wrap>
                        <RangePicker
                          value={dateRange}
                          onChange={(dates) => setDateRange(dates as any)}
                          style={{ maxWidth: "100%" }}
                        />
                        <Select
                          value={filterCategory}
                          onChange={setFilterCategory}
                          style={{ width: 150 }}
                          placeholder="Category"
                        >
                          <Select.Option value="all">
                            All Categories
                          </Select.Option>
                          {categories
                            .filter((c) => c.type === "category")
                            .map((c) => (
                              <Select.Option key={c.id} value={c.name}>
                                {c.name}
                              </Select.Option>
                            ))}
                        </Select>
                        {(filterCategory !== "all" || dateRange[0]) && (
                          <Button
                            icon={<ClearOutlined />}
                            onClick={handleClearFilters}
                          >
                            Clear
                          </Button>
                        )}
                      </Space>
                    </div>
                    <Table
                      scroll={{ x: 800 }}
                      columns={entryColumns}
                      dataSource={filteredEntries}
                      rowKey="id"
                      pagination={{
                        current: pagination.current,
                        pageSize: limit,
                        total: entries.length,
                        onChange: (page, pageSize) => {
                          setPagination({
                            ...pagination,
                            current: page,
                            pageSize,
                          });
                          if (page > pagination.current) {
                            if (page <= pageHistory.length) {
                              const diff = page - pagination.current;
                              if (diff === 1) {
                                setPagination({ ...pagination, current: page });
                              }
                            }
                          }
                        },
                      }}
                      footer={() => (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                          }}
                        >
                          <Button
                            disabled={currentPage === 0}
                            onClick={() => {
                              const newPage = Math.max(0, currentPage - 1);
                              setPagination({
                                ...pagination,
                                current: newPage + 1,
                              });
                            }}
                          >
                            Previous
                          </Button>
                          <Button
                            disabled={entries.length < limit}
                            onClick={() => {
                              const newPage = currentPage + 1;
                              setPagination({
                                ...pagination,
                                current: newPage + 1,
                              });
                            }}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    />
                  </>
                ),
              },
              {
                key: "releases",
                label: (
                  <span>
                    <WalletOutlined /> Funds Released
                  </span>
                ),
                children: (
                  <ReleaseList
                    releases={releases}
                    currency={project.currency}
                    currentPage={releasesPage}
                    totalReleases={releases.length}
                    onPageChange={setReleasesPage}
                    onDelete={handleDeleteRelease}
                    onEdit={(release) => {
                      setEditingRelease(release);
                      setShowReleaseModal(true);
                    }}
                    onView={handleViewRelease}
                    isOwner={user?.uid === project.userId}
                  />
                ),
              },
              {
                key: "reports",
                label: (
                  <span>
                    <BarChartOutlined /> Reports
                  </span>
                ),
                children: (
                  <ReportsTab
                    projectId={projectId}
                    currency={project.currency}
                  />
                ),
              },
            ]}
          />
        </Card>
      </Content>

      {/* Modals */}
      <ViewEntryModal
        isOpen={!!viewingEntry}
        onClose={() => setViewingEntry(null)}
        entry={viewingEntry}
        currency={project.currency}
        projectId={projectId}
        currentUserId={user?.uid}
      />

      <ViewReleaseModal
        isOpen={!!viewingRelease}
        onClose={() => setViewingRelease(null)}
        release={viewingRelease}
        currency={project.currency}
      />

      <AddEntryModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingEntry(undefined);
        }}
        projectId={projectId}
        onEntryAdded={fetchData}
        initialData={editingEntry}
      />

      <AddReleaseModal
        isOpen={showReleaseModal}
        onClose={() => {
          setShowReleaseModal(false);
          setEditingRelease(undefined);
        }}
        projectId={projectId}
        onReleaseAdded={fetchData}
        initialData={editingRelease}
        remainingEstimation={project.estimatedBudget - totalReleased}
      />

      <TeamManagementModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        projectId={projectId}
        projectName={project.name}
        teamMembers={project.teamMembers || []}
        currentUserRole={
          (user?.uid === project.userId
            ? "owner"
            : project.teamMembers?.find((m) => m.userId === user?.uid)?.role) ||
          "viewer"
        }
        onUpdate={fetchData}
      />

      <ManageCategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        projectId={projectId}
        onCategoriesUpdated={fetchData}
      />

      <ManageVendorsModal
        isOpen={showVendorsModal}
        onClose={() => setShowVendorsModal(false)}
        projectId={projectId}
      />

      <ManagePhasesModal
        isOpen={showPhasesModal}
        onClose={() => setShowPhasesModal(false)}
        projectId={projectId}
        currency={project.currency}
      />

      {/* Hidden Image for Preview */}
      {previewImage && (
        <Image
          style={{ display: "none" }}
          src={previewImage}
          alt="Preview"
          preview={{
            visible: true,
            onVisibleChange: (visible, prevVisible) => {
              if (!visible) setPreviewImage(null);
            },
            src: previewImage,
          }}
        />
      )}
    </Layout>
  );
}
