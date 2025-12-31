"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Project } from "@/types";
import {
  FolderKanban,
  Calendar,
  TrendingUp,
  MoreVertical,
  Trash2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

interface ProjectCardProps {
  project: Project & { totalSpent?: number };
  onDelete?: (projectId: string) => void;
  index?: number;
}

export default function ProjectCard({
  project,
  onDelete,
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

  const getProgressGradient = () => {
    if (isOverBudget) return "danger";
    if (progress > 80) return "warning";
    return "";
  };

  const getStatusBadge = () => {
    switch (project.status) {
      case "active":
        return <span className="badge badge-success">Active</span>;
      case "completed":
        return <span className="badge badge-primary">Completed</span>;
      case "on-hold":
        return <span className="badge badge-warning">On Hold</span>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const gradients = [
    "from-violet-500 to-purple-500",
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-indigo-500 to-violet-500",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      className="card card-hover relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      {/* Gradient Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-[20px] bg-gradient-to-r ${gradient}`}
      />

      {/* Menu Button */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="btn btn-ghost btn-sm p-1"
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
                className="absolute right-0 top-8 z-20 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
              >
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowMenu(false);
                      onDelete(project.id);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-error hover:bg-error-bg transition-colors"
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
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
          >
            <FolderKanban className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-bold text-lg truncate pr-8">{project.name}</h3>
            <p className="text-foreground-muted text-sm line-clamp-1">
              {project.description || "No description"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status & Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {isOverBudget && (
                <span className="badge badge-error flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Over
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-foreground-muted">
              <Calendar className="w-3 h-3" />
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          </div>

          {/* Budget Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-foreground-muted">Budget Used</span>
              <span className="font-bold">{progress.toFixed(0)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-bar-fill ${getProgressGradient()}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-foreground-muted mb-1">Spent</p>
              <p className="font-bold text-lg">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground-muted mb-1">
                {isOverBudget ? "Over Budget" : "Remaining"}
              </p>
              <p
                className={`font-bold text-lg ${
                  isOverBudget ? "text-error" : "text-success"
                }`}
              >
                {isOverBudget ? "+" : ""}
                {formatCurrency(Math.abs(remaining))}
              </p>
            </div>
          </div>

          {/* View Project Link */}
          <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
            <span className="flex items-center gap-2 text-primary font-semibold">
              <TrendingUp className="w-4 h-4" />
              View Details
            </span>
            <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
