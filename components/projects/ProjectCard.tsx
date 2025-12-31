"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Project } from "@/types";
import {
  formatCurrency,
  formatCurrencyCompact,
  DEFAULT_CURRENCY,
} from "@/lib/currency";
import {
  FolderKanban,
  Calendar,
  TrendingUp,
  MoreVertical,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Edit,
} from "lucide-react";
import { useState } from "react";

interface ProjectCardProps {
  project: Project & { totalSpent?: number };
  onDelete?: (projectId: string) => void;
  onEdit?: (project: Project) => void;
  index?: number;
}

const gradientColors = [
  { from: "#8b5cf6", to: "#6366f1" }, // violet
  { from: "#ec4899", to: "#f472b6" }, // pink
  { from: "#06b6d4", to: "#3b82f6" }, // cyan
  { from: "#10b981", to: "#14b8a6" }, // emerald
  { from: "#f59e0b", to: "#f97316" }, // amber
  { from: "#6366f1", to: "#8b5cf6" }, // indigo
];

export default function ProjectCard({
  project,
  onDelete,
  onEdit,
  index = 0,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const totalSpent = project.totalSpent || 0;
  const progress =
    project.estimatedBudget > 0
      ? Math.min((totalSpent / project.estimatedBudget) * 100, 100)
      : 0;
  const remaining = project.estimatedBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const projectCurrency = project.currency || DEFAULT_CURRENCY;

  const gradientColor = gradientColors[index % gradientColors.length];

  const getProgressColor = () => {
    if (isOverBudget) return "#ef4444";
    if (progress > 80) return "#f59e0b";
    return "#10b981";
  };

  const getStatusBadge = () => {
    const styles = {
      active: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" },
      completed: { bg: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" },
      "on-hold": { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
    };
    const style = styles[project.status] || styles.active;
    const labels = {
      active: "Active",
      completed: "Completed",
      "on-hold": "On Hold",
    };

    return (
      <span
        className="rounded-full"
        style={{
          padding: "4px 12px",
          fontSize: "12px",
          fontWeight: 600,
          backgroundColor: style.bg,
          color: style.color,
        }}
      >
        {labels[project.status] || "Active"}
      </span>
    );
  };

  return (
    <motion.div
      className="relative rounded-3xl group overflow-hidden"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        padding: "24px",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
    >
      {/* Gradient Top Bar */}
      <div
        className="absolute top-0 left-0 right-0 rounded-t-3xl"
        style={{
          height: "4px",
          background: `linear-gradient(135deg, ${gradientColor.from} 0%, ${gradientColor.to} 100%)`,
        }}
      />

      {/* Menu Button */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "var(--background-secondary)",
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                className="absolute right-0 top-10 z-20 rounded-xl overflow-hidden"
                style={{
                  width: "140px",
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                }}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMenu(false);
                    onEdit?.(project);
                  }}
                  className="flex items-center gap-2 w-full transition-colors hover:bg-[var(--background-secondary)]"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    color: "var(--foreground)",
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowMenu(false);
                      onDelete(project.id);
                    }}
                    className="flex items-center gap-2 w-full transition-colors hover:bg-[var(--background-secondary)]"
                    style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      color: "#ef4444",
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>

      <Link href={`/projects/${project.id}`}>
        <div
          className="flex items-start gap-4"
          style={{ marginBottom: "20px" }}
        >
          <div
            className="flex items-center justify-center rounded-2xl shrink-0"
            style={{
              width: "56px",
              height: "56px",
              background: `linear-gradient(135deg, ${gradientColor.from} 0%, ${gradientColor.to} 100%)`,
              boxShadow: `0 8px 20px ${gradientColor.from}40`,
            }}
          >
            <FolderKanban className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0" style={{ paddingTop: "4px" }}>
            <h3
              className="truncate"
              style={{
                fontSize: "18px",
                fontWeight: 700,
                paddingRight: "32px",
              }}
            >
              {project.name}
            </h3>
            <p
              className="line-clamp-1"
              style={{ fontSize: "14px", color: "var(--foreground-muted)" }}
            >
              {project.description || "No description"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Status & Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {isOverBudget && (
                <span
                  className="flex items-center gap-1 rounded-full"
                  style={{
                    padding: "4px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                  }}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Over
                </span>
              )}
            </div>
            <div
              className="flex items-center gap-1"
              style={{ fontSize: "12px", color: "var(--foreground-muted)" }}
            >
              <Calendar className="w-3 h-3" />
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          </div>

          {/* Budget Progress */}
          <div>
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: "10px" }}
            >
              <span
                style={{ fontSize: "13px", color: "var(--foreground-muted)" }}
              >
                Budget Used
              </span>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <div
              className="rounded-full overflow-hidden"
              style={{
                height: "8px",
                backgroundColor: "var(--background-secondary)",
              }}
            >
              <div
                className="rounded-full transition-all"
                style={{
                  height: "100%",
                  width: `${Math.min(progress, 100)}%`,
                  background: `linear-gradient(90deg, ${getProgressColor()} 0%, ${getProgressColor()}cc 100%)`,
                }}
              />
            </div>
          </div>

          {/* Amounts */}
          <div
            className="grid grid-cols-2 gap-4"
            style={{ paddingTop: "16px", borderTop: "1px solid var(--border)" }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--foreground-muted)",
                  marginBottom: "4px",
                }}
              >
                Spent
              </p>
              <p
                style={{ fontSize: "18px", fontWeight: 700 }}
                title={formatCurrency(totalSpent, projectCurrency)}
              >
                {formatCurrencyCompact(totalSpent, projectCurrency)}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--foreground-muted)",
                  marginBottom: "4px",
                }}
              >
                {isOverBudget ? "Over Budget" : "Remaining"}
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: isOverBudget ? "#ef4444" : "#10b981",
                }}
                title={formatCurrency(Math.abs(remaining), projectCurrency)}
              >
                {isOverBudget ? "+" : ""}
                {formatCurrencyCompact(Math.abs(remaining), projectCurrency)}
              </p>
            </div>
          </div>

          {/* View Project Link */}
          <div
            className="flex items-center justify-between"
            style={{ paddingTop: "12px", borderTop: "1px solid var(--border)" }}
          >
            <span
              className="flex items-center gap-2"
              style={{ fontSize: "14px", fontWeight: 600, color: "#8b5cf6" }}
            >
              <TrendingUp className="w-4 h-4" />
              View Details
            </span>
            <ChevronRight
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              style={{ color: "var(--foreground-muted)" }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
