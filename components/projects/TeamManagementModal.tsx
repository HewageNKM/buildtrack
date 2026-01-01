"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Mail,
  UserPlus,
  Trash2,
  Crown,
  Edit3,
  Eye,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { TeamMember, TeamMemberRole } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  teamMembers: TeamMember[];
  currentUserRole: TeamMemberRole;
  onUpdate: () => void;
}

const roleLabels: Record<
  TeamMemberRole,
  { label: string; color: string; bg: string; icon: typeof Crown }
> = {
  owner: {
    label: "Owner",
    color: "text-amber-400 dark:text-amber-400 text-amber-600",
    bg: "bg-amber-500/10",
    icon: Crown,
  },
  editor: {
    label: "Editor",
    color: "text-accent-violet",
    bg: "bg-accent-violet/10",
    icon: Edit3,
  },
  viewer: {
    label: "Viewer",
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
    icon: Eye,
  },
};

export default function TeamManagementModal({
  isOpen,
  onClose,
  projectName,
  projectId,
  teamMembers,
  currentUserRole,
  onUpdate,
}: TeamManagementModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>("editor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useBodyScrollLock(isOpen);

  const canManageTeam = currentUserRole === "owner";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (
      teamMembers.some((m) => m.email.toLowerCase() === email.toLowerCase())
    ) {
      setError("This user is already a team member");
      return;
    }

    setLoading(true);
    try {
      await api.team.invite(projectId, email.trim(), selectedRole);
      toast.success(`Invite sent to ${email}`);
      setEmail("");
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    setRemovingId(userId);
    try {
      await api.team.remove(projectId, userId);
      if (userId === user?.uid) {
        toast.success("Left project successfully");
        onClose();
        window.location.href = "/projects";
      } else {
        toast.success("Team member removed");
        onUpdate();
      }
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(
      `Join my project "${projectName}" on BuildTrack Pro!`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Shared classes
  const inputClass =
    "w-full px-4 py-3.5 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm transition-all outline-none text-foreground placeholder:text-foreground-muted/50 focus:border-accent-violet/50 focus:bg-[var(--input-focus-bg)] focus:shadow-md";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-[520px] glass-card rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)] bg-[var(--card)] shrink-0 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-indigo-600 shadow-lg shadow-indigo-500/30 text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-foreground leading-tight">
                    Team Management
                  </h2>
                  <p className="text-xs text-foreground-muted truncate">
                    {projectName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--input-bg)] text-foreground-muted hover:bg-[var(--input-focus-bg)] hover:text-foreground transition-colors border border-[var(--input-border)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Invite Form */}
              {canManageTeam && (
                <div className="mb-8">
                  <form onSubmit={handleInvite} className="space-y-3">
                    {error && (
                      <motion.div
                        className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted group-focus-within:text-accent-violet transition-colors" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`${inputClass} pl-12`}
                          placeholder="teammate@example.com"
                        />
                      </div>
                      <select
                        value={selectedRole}
                        onChange={(e) =>
                          setSelectedRole(e.target.value as TeamMemberRole)
                        }
                        className={`${inputClass} sm:w-32`}
                        style={{ appearance: "none" }}
                      >
                        <option
                          value="editor"
                          className="bg-background-secondary text-foreground"
                        >
                          Editor
                        </option>
                        <option
                          value="viewer"
                          className="bg-background-secondary text-foreground"
                        >
                          Viewer
                        </option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-accent-violet to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:from-accent-violet hover:to-indigo-500 transition-all disabled:opacity-50"
                        whileHover={{ scale: loading ? 1 : 1.01 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" /> Invite Member
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={handleCopyInvite}
                        className="px-5 py-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-[var(--input-focus-bg)] text-foreground-muted transition-all"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}

              {/* Team Members List */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground-muted/70">
                  Current Members ({teamMembers.length})
                </h3>
                <div className="space-y-2">
                  {teamMembers.map((member) => {
                    const roleInfo = roleLabels[member.role];
                    const RoleIcon = roleInfo.icon;

                    return (
                      <motion.div
                        key={member.userId}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-accent-violet/30 transition-colors group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--input-focus-bg)] border border-[var(--input-border)] text-foreground font-black text-sm shadow-sm shrink-0">
                          {(member.displayName || member.email)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {member.displayName || member.email.split("@")[0]}
                          </p>
                          <p className="text-[11px] text-foreground-muted truncate">
                            {member.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${roleInfo.bg} ${roleInfo.color}`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleInfo.label}
                          </div>

                          {canManageTeam && member.role !== "owner" && (
                            <button
                              onClick={() => handleRemove(member.userId)}
                              disabled={removingId === member.userId}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              {removingId === member.userId ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Role Permissions Legend */}
              <div className="mt-8 p-5 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)]">
                <p className="text-xs font-black uppercase tracking-widest text-foreground-muted mb-4">
                  Permission Matrix
                </p>
                <div className="space-y-3">
                  {[
                    {
                      icon: Crown,
                      label: "Owner",
                      desc: "Full administrative access & billing control.",
                      color:
                        "text-amber-400 dark:text-amber-400 text-amber-600",
                    },
                    {
                      icon: Edit3,
                      label: "Editor",
                      desc: "Can create, edit, and delete budget entries.",
                      color: "text-accent-violet",
                    },
                    {
                      icon: Eye,
                      label: "Viewer",
                      desc: "Read-only access to charts and history.",
                      color: "text-accent-cyan",
                    },
                  ].map((role) => (
                    <div key={role.label} className="flex gap-3">
                      <role.icon className={`w-4 h-4 shrink-0 ${role.color}`} />
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-foreground">
                          {role.label}
                        </span>
                        <span className="text-foreground-muted">
                          {" "}
                          — {role.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
