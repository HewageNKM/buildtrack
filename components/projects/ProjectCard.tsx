"use client";

import Link from "next/link";
import { Project } from "@/types";
import { formatCurrencyCompact, DEFAULT_CURRENCY } from "@/lib/currency";
import {
  Card,
  Progress,
  Tag,
  Dropdown,
  Button,
  Typography,
  Space,
  Statistic,
} from "antd";
import {
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  RightOutlined,
  WarningOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Text, Title } = Typography;

interface ProjectCardProps {
  project: Project & { totalSpent?: number };
  onDelete?: (projectId: string) => void;
  onEdit?: (project: Project) => void;
  index?: number;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: "green", label: "Active" },
  completed: { color: "purple", label: "Completed" },
  "on-hold": { color: "orange", label: "On Hold" },
};

export default function ProjectCard({
  project,
  onDelete,
  onEdit,
  index = 0,
}: ProjectCardProps) {
  const totalSpent = project.totalSpent || 0;
  const progress =
    project.estimatedBudget > 0
      ? Math.min((totalSpent / project.estimatedBudget) * 100, 100)
      : 0;
  const remaining = project.estimatedBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const projectCurrency = project.currency || DEFAULT_CURRENCY;

  const getProgressStatus = (): "success" | "normal" | "exception" => {
    if (isOverBudget) return "exception";
    if (progress > 80) return "normal";
    return "success";
  };

  const status =
    statusConfig[project.status || "active"] || statusConfig.active;

  const menuItems: MenuProps["items"] = [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => onEdit?.(project),
    },
  ];

  if (onDelete) {
    menuItems.push({
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      danger: true,
      onClick: () => onDelete(project.id),
    });
  }

  return (
    <Card
      hoverable
      style={{ borderRadius: 16, overflow: "hidden" }}
      styles={{
        body: { padding: 0 },
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, #8b5cf6, #6366f1)`,
        }}
      />

      <div style={{ padding: 24 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Space>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderOutlined style={{ fontSize: 24, color: "white" }} />
            </div>
            <div>
              <Link href={`/projects/${project.id}`}>
                <Title level={5} style={{ margin: 0, cursor: "pointer" }}>
                  {project.name}
                </Title>
              </Link>
              <Text type="secondary" ellipsis style={{ maxWidth: 200 }}>
                {project.description || "No description"}
              </Text>
            </div>
          </Space>

          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Card size="small" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Statistic
              title="Spent"
              value={formatCurrencyCompact(totalSpent, projectCurrency)}
              styles={{ content: { fontSize: 16 } }}
            />
          </Card>
          <Card size="small" style={{ background: "rgba(255,255,255,0.02)" }}>
            <Statistic
              title="Budget"
              value={formatCurrencyCompact(
                project.estimatedBudget,
                projectCurrency
              )}
              styles={{ content: { fontSize: 16 } }}
            />
          </Card>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text
              type={isOverBudget ? "danger" : "secondary"}
              style={{ fontSize: 12 }}
            >
              {Math.round(progress)}% utilized
            </Text>
            <Text
              type={isOverBudget ? "danger" : "secondary"}
              style={{ fontSize: 12 }}
            >
              {isOverBudget ? (
                <Space size={4}>
                  <WarningOutlined />
                  {formatCurrencyCompact(
                    Math.abs(remaining),
                    projectCurrency
                  )}{" "}
                  over
                </Space>
              ) : (
                `${formatCurrencyCompact(remaining, projectCurrency)} left`
              )}
            </Text>
          </div>
          <Progress
            percent={progress}
            status={getProgressStatus()}
            showInfo={false}
            strokeColor={
              isOverBudget ? "#ef4444" : progress > 80 ? "#f59e0b" : "#10b981"
            }
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Tag color={status.color}>{status.label}</Tag>
          <Link href={`/projects/${project.id}`}>
            <Button
              type="link"
              size="small"
              icon={<RightOutlined />}
              iconPlacement="end"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
