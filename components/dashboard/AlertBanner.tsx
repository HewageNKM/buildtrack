"use client";

import { useState, useEffect } from "react";
import { Alert, Space, Badge, Button, Typography, Spin } from "antd";
import {
  BellOutlined,
  WarningFilled,
  CloseCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import { api } from "@/lib/api";
import { BudgetAlert } from "@/types";
import Link from "next/link";

const { Text } = Typography;

interface AlertBannerProps {
  maxAlerts?: number;
  compact?: boolean;
}

export default function AlertBanner({
  maxAlerts = 3,
  compact = false,
}: AlertBannerProps) {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const result = await api.alerts.check();
      setAlerts(result.alerts);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const visibleAlerts = alerts
    .filter((a) => !dismissed.has(a.id))
    .slice(0, maxAlerts);

  if (loading) {
    return compact ? null : <Spin size="small" />;
  }

  if (visibleAlerts.length === 0) {
    return null;
  }

  const alertTypeMapping = {
    critical: { type: "error" as const, icon: <CloseCircleFilled /> },
    warning: { type: "warning" as const, icon: <WarningFilled /> },
    info: { type: "info" as const, icon: <InfoCircleFilled /> },
  };

  if (compact) {
    const criticalCount = alerts.filter(
      (a) => a.severity === "critical" && !dismissed.has(a.id)
    ).length;
    const warningCount = alerts.filter(
      (a) => a.severity === "warning" && !dismissed.has(a.id)
    ).length;

    if (criticalCount + warningCount === 0) return null;

    return (
      <Badge count={criticalCount + warningCount} size="small">
        <Button
          type="text"
          icon={
            <BellOutlined
              style={{ color: criticalCount > 0 ? "#ef4444" : "#f59e0b" }}
            />
          }
        />
      </Badge>
    );
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={8}>
      {visibleAlerts.map((alert) => {
        const config = alertTypeMapping[alert.severity];
        return (
          <Alert
            key={alert.id}
            type={config.type}
            message={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{alert.message}</span>
                <Link href={`/projects/${alert.projectId}`}>
                  <Button type="link" size="small">
                    View
                  </Button>
                </Link>
              </div>
            }
            closable
            onClose={() => dismissAlert(alert.id)}
            showIcon
            icon={config.icon}
            style={{ fontSize: 13 }}
          />
        );
      })}
      {alerts.filter((a) => !dismissed.has(a.id)).length > maxAlerts && (
        <Text type="secondary" style={{ fontSize: 12, paddingLeft: 8 }}>
          +{alerts.filter((a) => !dismissed.has(a.id)).length - maxAlerts} more
          alerts
        </Text>
      )}
    </Space>
  );
}
