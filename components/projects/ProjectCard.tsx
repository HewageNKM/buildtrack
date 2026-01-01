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
      className="relative rounded-3xl group glass-card hover:border-[var(--card-border)] transition-all duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: "var(--shadow-glow)" }}
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
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--input-focus-bg)] text-foreground-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
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
              className="absolute right-0 top-10 w-36 rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--card-border)] shadow-xl z-20 backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(false);
                  onEdit?.(project);
                }}
                className="flex items-center gap-2 w-full p-3 text-sm text-foreground hover:bg-[var(--input-bg)] transition-colors"
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
            <h3 className="text-lg font-bold text-foreground truncate pr-6 mb-1 group-hover:text-accent-violet transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-foreground-muted line-clamp-2 leading-relaxed">
              {project.description || "No description"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--input-bg)] rounded-xl p-3 border border-[var(--input-border)]">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-foreground-muted">
                Spent
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrencyCompact(totalSpent, projectCurrency)}
            </p>
          </div>
          <div className="bg-[var(--input-bg)] rounded-xl p-3 border border-[var(--input-border)]">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-foreground-muted">
                Budget
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrencyCompact(project.estimatedBudget, projectCurrency)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span
              className={
                isOverBudget
                  ? "text-red-400 font-bold"
                  : "text-foreground-muted"
              }
            >
              {Math.round(progress)}% utilized
            </span>
            <span
              className={
                isOverBudget
                  ? "text-red-400 font-bold"
                  : "text-foreground-muted"
              }
            >
              {remaining < 0 ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {formatCurrencyCompact(
                    Math.abs(remaining),
                    projectCurrency
                  )}{" "}
                  over
                </span>
              ) : (
                `${formatCurrencyCompact(remaining, projectCurrency)} left`
              )}
            </span>
          </div>

          <div className="h-2 bg-[var(--input-bg)] rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getProgressColorClass()} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--card-border)]">
          <span
            className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getStatusBadgeStyles()}`}
          >
            {getStatusLabel()}
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-accent-violet opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
            View Details <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
