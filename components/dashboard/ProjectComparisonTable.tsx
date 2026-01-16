"use client";

import { Table, Progress, Typography, Tag } from "antd";
import { ProjectWithStats } from "@/types";
import {
  formatCurrencyCompact,
  DEFAULT_CURRENCY,
  CurrencyCode,
} from "@/lib/currency";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";

const { Text } = Typography;

interface ProjectComparisonTableProps {
  projects: ProjectWithStats[];
  currency?: CurrencyCode;
}

export default function ProjectComparisonTable({
  projects,
  currency = DEFAULT_CURRENCY,
}: ProjectComparisonTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "processing";
      case "completed":
        return "success";
      case "on-hold":
        return "warning";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<ProjectWithStats> = [
    {
      title: "Project",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Link href={`/projects/${record.id}`}>
          <Text strong style={{ color: "#6366f1" }}>
            {name}
          </Text>
        </Link>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Budget",
      dataIndex: "estimatedBudget",
      key: "budget",
      align: "right",
      render: (val) => formatCurrencyCompact(val, currency),
      sorter: (a, b) => a.estimatedBudget - b.estimatedBudget,
    },
    {
      title: "Spent",
      dataIndex: "totalSpent",
      key: "spent",
      align: "right",
      render: (val) => formatCurrencyCompact(val, currency),
      sorter: (a, b) => a.totalSpent - b.totalSpent,
    },
    {
      title: "Variance",
      key: "variance",
      align: "right",
      render: (_, record) => {
        const variance = record.estimatedBudget - record.totalSpent;
        const isNegative = variance < 0;
        return (
          <Text type={isNegative ? "danger" : "success"}>
            {isNegative ? "-" : "+"}
            {formatCurrencyCompact(Math.abs(variance), currency)}
          </Text>
        );
      },
      sorter: (a, b) =>
        a.estimatedBudget - a.totalSpent - (b.estimatedBudget - b.totalSpent),
    },
    {
      title: "Budget Used",
      key: "progress",
      width: 180,
      render: (_, record) => {
        const percent =
          record.estimatedBudget > 0
            ? Math.round((record.totalSpent / record.estimatedBudget) * 100)
            : 0;
        const status =
          percent > 100 ? "exception" : percent > 80 ? "active" : "normal";
        return (
          <Progress
            percent={Math.min(percent, 100)}
            size="small"
            status={status}
            format={() => `${percent}%`}
          />
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={projects}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 5 }}
      scroll={{ x: 700 }}
    />
  );
}
