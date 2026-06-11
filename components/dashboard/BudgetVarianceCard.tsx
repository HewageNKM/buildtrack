"use client";

import { Card, Typography, Empty } from "antd";
import { ProjectWithStats } from "@/types";
import {
  formatCurrencyCompact,
  DEFAULT_CURRENCY,
  CurrencyCode,
} from "@/lib/currency";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

interface BudgetVarianceCardProps {
  projects: ProjectWithStats[];
  currency?: CurrencyCode;
}

export default function BudgetVarianceCard({
  projects,
  currency = DEFAULT_CURRENCY,
}: BudgetVarianceCardProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <Empty description="No projects to analyze" />
      </Card>
    );
  }

  const totalBudget = projects.reduce(
    (sum, p) => sum + (p.estimatedBudget || 0),
    0,
  );
  const totalSpent = projects.reduce((sum, p) => sum + (p.totalSpent || 0), 0);
  const variance = totalBudget - totalSpent;
  const variancePercent =
    totalBudget > 0 ? ((variance / totalBudget) * 100).toFixed(1) : 0;

  const overBudgetCount = projects.filter(
    (p) => (p.totalSpent || 0) > (p.estimatedBudget || 0),
  ).length;

  const underBudgetCount = projects.filter((p) => {
    const spent = p.totalSpent || 0;
    const budget = p.estimatedBudget || 0;
    return spent < budget * 0.8 && spent > 0;
  }).length;

  const onTrackCount = projects.length - overBudgetCount - underBudgetCount;

  const Icon =
    variance > 0
      ? ArrowUpOutlined
      : variance < 0
        ? ArrowDownOutlined
        : MinusOutlined;
  const color = variance > 0 ? "#10b981" : variance < 0 ? "#ef4444" : "#6b7280";

  return (
    <Card>
      <Title level={5} type="secondary" style={{ marginBottom: 16 }}>
        Budget Variance Analysis
      </Title>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Icon style={{ fontSize: 32, color }} />
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Total Variance
          </Text>
          <div style={{ fontSize: 24, fontWeight: "bold", color }}>
            {variance >= 0 ? "+" : ""}
            {formatCurrencyCompact(variance, currency)}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {variancePercent}% {variance >= 0 ? "under" : "over"} budget
          </Text>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div
          style={{
            padding: "8px 16px",
            background: "rgba(16, 185, 129, 0.1)",
            borderRadius: 8,
            flex: 1,
            minWidth: 100,
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          <div style={{ color: "#10b981", fontWeight: "bold", fontSize: 18 }}>
            {onTrackCount}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            On Track
          </Text>
        </div>
        <div
          style={{
            padding: "8px 16px",
            background: "rgba(245, 158, 11, 0.1)",
            borderRadius: 8,
            flex: 1,
            minWidth: 100,
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <div style={{ color: "#f59e0b", fontWeight: "bold", fontSize: 18 }}>
            {underBudgetCount}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Under 80%
          </Text>
        </div>
        <div
          style={{
            padding: "8px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: 8,
            flex: 1,
            minWidth: 100,
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <div style={{ color: "#ef4444", fontWeight: "bold", fontSize: 18 }}>
            {overBudgetCount}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Over Budget
          </Text>
        </div>
      </div>
    </Card>
  );
}
