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

// Let's check imports. No clsx/cn in original file. I will avoid adding new imports that might break if files don't exist. I'll use standard template literals.

interface ProjectCardProps {
  project: Project & { totalSpent?: number };
  onDelete?: (projectId: string) => void;
  onEdit?: (project: Project) => void;
  index?: number;
}

const gradientVariants = [
  "from-accent-violet to-primary", // violet
  "from-accent-pink to-rose-400", // pink
  "from-accent-cyan to-blue-500", // cyan
  "from-emerald-400 to-teal-500", // emerald
  "from-amber-400 to-orange-500", // amber
  "from-indigo-500 to-purple-600", // indigo
];

const shadowVariants = [
  "shadow-accent-violet/20",
  "shadow-accent-pink/20",
  "shadow-accent-cyan/20",
  "shadow-emerald-400/20",
  "shadow-amber-400/20",
  "shadow-indigo-500/20",
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

  const gradientClass = gradientVariants[index % gradientVariants.length];
  const shadowClass = shadowVariants[index % shadowVariants.length];

  const getProgressColorClass = () => {
    if (isOverBudget) return "bg-red-500";
    if (progress > 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStatusBadgeStyles = () => {
    switch (project.status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "completed":
        return "bg-accent-violet/10 text-accent-violet border-accent-violet/20";
      case "on-hold":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  const getStatusLabel = () => {
    switch (project.status) {
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "on-hold":
        return "On Hold";
      default:
        return "Active";
    }
  };

  return (
    <motion.div
      className="relative rounded-3xl group glass-card hover:border-white/10 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" }}
    >
      {/* Gradient Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`}
      />

      {/* Menu Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowMenu(!showMenu);
          }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-foreground-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(false);
              }}
            />
            <motion.div
              className="absolute right-0 top-10 w-36 rounded-xl overflow-hidden bg-[#0f172a] border border-white/10 shadow-xl z-20"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(false);
                  onEdit?.(project);
                }}
                className="flex items-center gap-2 w-full p-3 text-sm text-foreground hover:bg-white/5 transition-colors"
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
                  className="flex items-center gap-2 w-full p-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </motion.div>
          </>
        )}
      </div>

      <Link href={`/projects/${project.id}`} className="block p-6">
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg ${shadowClass} text-white shrink-0`}
          >
            <FolderKanban className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-lg font-bold text-white truncate pr-6 mb-1 group-hover:text-accent-violet transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-foreground-muted line-clamp-1">
              {project.description || "No description provided"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status & Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyles()}`}
              >
                {getStatusLabel()}
              </span>
              {isOverBudget && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  Over
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground-muted font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          </div>

          {/* Budget Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted font-medium">
                Budget Used
              </span>
              <span className="text-sm font-bold text-white">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColorClass()}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-xs text-foreground-muted mb-1 font-medium">
                Spent
              </p>
              <p
                className="text-lg font-bold text-white tracking-tight"
                title={formatCurrency(totalSpent, projectCurrency)}
              >
                {formatCurrencyCompact(totalSpent, projectCurrency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground-muted mb-1 font-medium">
                {isOverBudget ? "Over Budget" : "Remaining"}
              </p>
              <p
                className={`text-lg font-bold tracking-tight ${
                  isOverBudget ? "text-red-400" : "text-emerald-400"
                }`}
                title={formatCurrency(Math.abs(remaining), projectCurrency)}
              >
                {isOverBudget ? "+" : ""}
                {formatCurrencyCompact(Math.abs(remaining), projectCurrency)}
              </p>
            </div>
          </div>

          {/* View Project Link */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-accent-violet group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
              View Details
            </span>
            <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
