"use client";

import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#8b5cf6",
          colorSuccess: "#10b981",
          colorError: "#ef4444",
          colorWarning: "#f59e0b",
          colorInfo: "#06b6d4",
          borderRadius: 12,
          fontFamily: "var(--font-geist-sans)",
          // Adjust background tokens for better integration if needed
          colorBgBase: theme === "dark" ? "#030712" : "#ffffff",
          colorBgContainer: theme === "dark" ? "#0f172a" : "#ffffff",
        },
        components: {
          Button: {
            borderRadius: 12,
          },
          Input: {
            borderRadius: 12,
          },
          Select: {
            borderRadius: 12,
          },
          Modal: {
            borderRadiusLG: 24,
          },
          Table: {
            borderRadius: 12,
          },
          Card: {
            borderRadiusLG: 16,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
