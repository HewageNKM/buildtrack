"use client";

import { Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const antdSize =
    size === "lg" ? "large" : size === "sm" ? "small" : "default";

  return <Spin size={antdSize} className={className} />;
}

export function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--background)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#8b5cf6" }} spin />
          }
          size="large"
        />
        <Typography.Text
          type="secondary"
          style={{ fontSize: 16, fontWeight: 500 }}
        >
          Loading...
        </Typography.Text>
      </div>
    </div>
  );
}
