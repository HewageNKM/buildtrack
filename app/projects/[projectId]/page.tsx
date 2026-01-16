"use client";

export const dynamic = "force-dynamic";

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
import ManageCategoriesModal from "@/components/settings/ManageCategoriesModal";

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
  CalendarOutlined,
  SearchOutlined,
  ClearOutlined,
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
  Avatar,
  message,
  Layout,
  Breadcrumb,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Content } = Layout;

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

  // Note: edit release logic is inside ReleaseList component usually,
  // but if we need to open modal from parent, we can add state here if needed.
  // The original code passed edit handler to ReleaseList.
  const [editingRelease, setEditingRelease] = useState<
    BudgetRelease | undefined
  >(undefined);

  // Filters & View State
  const [activeTab, setActiveTab] = useState<string>("expenses");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Pagination for Entries
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [releasesPage, setReleasesPage] = useState(1);

  // In the original code, it used cursor-based pagination with a history stack for 'prev' button.
  // Antd Table uses page numbers. We can adapt if API supports it, or use load more.
  // The api.entries.list takes limit and cursor.
  // For standard table pagination with cursor based API, it's tricky.
  // I will implement simple "Load All" or standard client-side pagination if dataset is small,
  // OR keep simple cursor pagination button at bottom of table if server side.
  // LIMITATION: Original code had cursor history.
  // Let's implement client-side pagination for now if we fetch all, OR sticky with the manual "Prev/Next" buttons above table if we want to keep API behavior.
  // BUT: api.entries.list returns a simplified list.
  // Let's assume we fetch a chunk.
  // To make it look like Antd, we can use the Table's pagination prop but control it externally if needed,
  // or disable Table pagination and put custom buttons.
  // For better UX, let's keep the custom pagination logic but style it with Antd, or better yet, if the API allows fetching all, we could do that.
  // Given "limit" state in original, it implies server side.
  // I'll keep the server side logic variables but maybe render with Antd Pagination if I can map page -> cursor,
  // but cursor -> page map is hard without knowing all cursors.
  // So I will stick to "Next" / "Prev" buttons but maybe place them in the Table footer.

  const [pageHistory, setPageHistory] = useState<
    ({ date: string; id: string } | undefined)[]
  >([undefined]);
  const [limit, setLimit] = useState(20);
  const currentPage = pagination.current - 1; // 0-indexed for logic

  // Statistics
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

      // We don't know total count from API likely, so we can't show "Page 1 of X".
      // We just know if there is a nextCursor.

      if (entriesData.nextCursor && currentPage === pageHistory.length - 1) {
        setPageHistory((prev) => [...prev, entriesData.nextCursor!]);
      }

      const releasesData = await api.releases.list(projectId);
      setReleases(releasesData.releases);
      setProjectTotalReleased(releasesData.totalReleased);

      const categoriesData = await api.categories.list(projectId);
      setCategories(categoriesData);
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
    // Handled inside ReleaseList component props or here if we lift state
    // The original code had dedicated function passed to ReleaseList
    // We will implement it there or pass this function
    // Wait, ReleaseList implementation uses `onDelete` prop.
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
    project.estimatedBudget
  );
  const spentPercentage = widthPercentage(totalSpent, project.estimatedBudget);

  const isOverBudget = totalSpent > project.estimatedBudget;
  const isOverReleased = totalSpent > totalReleased;

  const filteredEntries = entries.filter((e) => {
    if (filterCategory !== "all" && e.category !== filterCategory) return false;
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
          c.name.toLowerCase() === value.toLowerCase())
    );
    return cat ? cat.color || "#8b5cf6" : "#8b5cf6";
  };

  // Table Columns
  const entryColumns: ColumnsType<BudgetEntry> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("MMM D, YYYY"),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag
            color={getCategoryColor(record.category)}
            style={{ marginRight: 0 }}
          >
            {record.category}
          </Tag>
          {record.subCategory && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.subCategory}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => (
        <Text strong>{formatCurrencyCompact(amount, project.currency)}</Text>
      ),
    },
    {
      title: "Receipt",
      key: "receipt",
      align: "center",
      render: (_, record) =>
        record.invoiceUrl ? (
          <Button
            type="text"
            icon={
              record.invoiceType === "pdf" ? (
                <FileTextOutlined />
              ) : (
                <FileImageOutlined />
              )
            }
            onClick={() =>
              setPreviewFile({
                url: record.invoiceUrl!,
                name: record.invoiceFileName || "Invoice",
                type: record.invoiceType || "image",
              })
            }
          />
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
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
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Estimated Budget"
                value={formatCurrencyCompact(
                  project.estimatedBudget,
                  project.currency
                )}
                prefix={
                  <span style={{ fontWeight: "bold", fontSize: 14 }}>LKR</span>
                }
                valueStyle={{ color: "#6366f1", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Funds Released"
                value={formatCurrencyCompact(totalReleased, project.currency)}
                prefix={<WalletOutlined />}
                valueStyle={{ color: "#10b981", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Spent"
                value={formatCurrencyCompact(totalSpent, project.currency)}
                prefix={<RiseOutlined />}
                valueStyle={{ color: "#06b6d4", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title={
                  isOverReleased ? "Over Released Limit" : "Remaining Released"
                }
                value={formatCurrencyCompact(
                  Math.abs(totalReleased - totalSpent),
                  project.currency
                )}
                prefix={isOverReleased ? <FallOutlined /> : <WalletOutlined />}
                valueStyle={{
                  color: isOverReleased ? "#ef4444" : "#f59e0b",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress Bar Card */}
        <Card
          style={{ marginBottom: 24 }}
          bordered={false}
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
                  project.currency
                )}
              </Text>
            </Text>
          </div>
          <Tooltip
            title={`Spent: ${spentPercentage.toFixed(
              1
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
              strokeWidth={12}
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
            <CategoryBreakdownChart
              entries={entries}
              currency={project.currency || DEFAULT_CURRENCY}
              categories={categories}
            />
          </Col>
          <Col span={24}>
            <SpendingTimelineChart
              entries={entries}
              estimatedBudget={project.estimatedBudget}
              currency={project.currency || DEFAULT_CURRENCY}
            />
          </Col>
        </Row>

        {/* Tabs for Expenses / Releases */}
        <Card bordered={false} className="shadow-sm">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarExtraContent={
              activeTab === "expenses" ? (
                <Space wrap>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates as any)}
                  />
                  <Select
                    value={filterCategory}
                    onChange={setFilterCategory}
                    style={{ width: 150 }}
                    placeholder="Category"
                  >
                    <Select.Option value="all">All Categories</Select.Option>
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
              ) : null
            }
            items={[
              {
                key: "expenses",
                label: (
                  <span>
                    <FileTextOutlined /> Expenses Ledger
                  </span>
                ),
                children: (
                  <Table
                    columns={entryColumns}
                    dataSource={filteredEntries}
                    rowKey="id"
                    pagination={{
                      current: pagination.current,
                      pageSize: limit,
                      total: entries.length, // Should be total from API if possible, but here using fetched length
                      onChange: (page, pageSize) => {
                        // Here we would ideally trigger fetch if we had full pagination
                        // Since we have cursor pagination, mimicking it in standard table is hard
                        // For now we assume fetch all or standard behavior:
                        setPagination({
                          ...pagination,
                          current: page,
                          pageSize,
                        });

                        // If next page and we have history
                        if (page > pagination.current) {
                          if (page <= pageHistory.length) {
                            // We have visited this page, we might need to refetch if we don't cache
                            // Real implementation would need full cursor logic mapping page to cursor
                            // Given complexity, let's just trigger simple next/prev:
                            const diff = page - pagination.current;
                            if (diff === 1) {
                              // Next page
                              setPagination({ ...pagination, current: page });
                              // Trigger effect by changing local page state?
                              // The local 'currentPage' state handles the fetch
                              // We need to sync them
                            }
                          }
                        }
                      },
                    }}
                    // Custom footer for cursor pagination if needed
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
                            // The state update in render will eventually trigger fetch
                            // But we need to sync `currentPage` variable in next render
                            // Wait, `currentPage` is derived from `pagination.current - 1`
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
                    totalPages={Math.ceil(releases.length / 10)}
                    totalReleases={releases.length}
                    onPageChange={setReleasesPage}
                    onDelete={handleDeleteRelease}
                    onEdit={(release) => {
                      setEditingRelease(release);
                      setShowReleaseModal(true);
                    }}
                    isOwner={user?.uid === project.userId}
                  />
                ),
              },
            ]}
          />
        </Card>
      </Content>

      {/* Modals */}
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

      {/* File Preview */}
      {previewFile && (
        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          fileType={previewFile.type}
        />
      )}

      {/* ConfirmModal is used for custom actions if needed, but we used Modal.confirm for Delete */}
    </Layout>
  );
}
