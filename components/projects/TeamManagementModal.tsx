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

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  teamMembers: TeamMember[];
  currentUserRole: TeamMemberRole;
  onInviteMember: (email: string, role: TeamMemberRole) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onUpdateRole: (userId: string, role: TeamMemberRole) => Promise<void>;
}

const roleLabels: Record<
  TeamMemberRole,
  { label: string; color: string; icon: typeof Crown }
> = {
  owner: { label: "Owner", color: "#fbbf24", icon: Crown },
  editor: { label: "Editor", color: "#8b5cf6", icon: Edit3 },
  viewer: { label: "Viewer", color: "#06b6d4", icon: Eye },
};

export default function TeamManagementModal({
  isOpen,
  onClose,
  projectName,
  teamMembers,
  currentUserRole,
  onInviteMember,
  onRemoveMember,
}: // onUpdateRole - reserved for future use
TeamManagementModalProps) {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>("editor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canManageTeam = currentUserRole === "owner";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    // Check if already a member
    if (
      teamMembers.some((m) => m.email.toLowerCase() === email.toLowerCase())
    ) {
      setError("This user is already a team member");
      return;
    }

    setLoading(true);
    try {
      await onInviteMember(email.trim(), selectedRole);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    setRemovingId(userId);
    try {
      await onRemoveMember(userId);
    } catch (err) {
      console.error(err);
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

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    backgroundColor: "var(--background-secondary)",
    border: "2px solid transparent",
    borderRadius: "12px",
    fontSize: "15px",
    color: "var(--foreground)",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            padding: "24px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full rounded-3xl"
            style={{
              maxWidth: "520px",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between"
              style={{
                padding: "24px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: "44px",
                    height: "44px",
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
                    Team Members
                  </h2>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    {projectName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-xl transition-colors"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "var(--background-secondary)",
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Invite Form */}
              {canManageTeam && (
                <form onSubmit={handleInvite} style={{ marginBottom: "24px" }}>
                  {error && (
                    <motion.div
                      className="flex items-center gap-3 rounded-xl"
                      style={{
                        padding: "14px",
                        marginBottom: "16px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#f87171",
                        fontSize: "14px",
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Mail
                          className="w-5 h-5"
                          style={{ color: "var(--foreground-muted)" }}
                        />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: "44px" }}
                        placeholder="teammate@example.com"
                      />
                    </div>
                    <select
                      value={selectedRole}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as TeamMemberRole)
                      }
                      style={{
                        ...inputStyle,
                        width: "auto",
                        paddingLeft: "12px",
                        paddingRight: "12px",
                      }}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>

                  <div className="flex gap-3" style={{ marginTop: "12px" }}>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl text-white"
                      style={{
                        padding: "14px",
                        background:
                          "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                        fontSize: "15px",
                        fontWeight: 700,
                        boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
                        opacity: loading ? 0.7 : 1,
                      }}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Invite
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleCopyInvite}
                      className="flex items-center justify-center gap-2 rounded-xl"
                      style={{
                        padding: "14px 20px",
                        backgroundColor: "var(--background-secondary)",
                        border: "2px solid var(--border)",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {copied ? (
                        <Check
                          className="w-4 h-4"
                          style={{ color: "#10b981" }}
                        />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </form>
              )}

              {/* Team Members List */}
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "16px",
                    color: "var(--foreground-muted)",
                  }}
                >
                  Current Members ({teamMembers.length})
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {teamMembers.map((member) => {
                    const roleInfo = roleLabels[member.role];
                    const RoleIcon = roleInfo.icon;

                    return (
                      <motion.div
                        key={member.userId}
                        className="flex items-center gap-3 rounded-xl"
                        style={{
                          padding: "14px",
                          backgroundColor: "var(--background-secondary)",
                          border: "1px solid var(--border)",
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div
                          className="flex items-center justify-center rounded-full shrink-0"
                          style={{
                            width: "40px",
                            height: "40px",
                            background: `linear-gradient(135deg, ${roleInfo.color} 0%, ${roleInfo.color}99 100%)`,
                          }}
                        >
                          <span className="text-white text-sm font-bold">
                            {(member.displayName || member.email)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="truncate"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            {member.displayName || member.email.split("@")[0]}
                          </p>
                          <p
                            className="truncate"
                            style={{
                              fontSize: "12px",
                              color: "var(--foreground-muted)",
                            }}
                          >
                            {member.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center gap-1 rounded-full"
                            style={{
                              padding: "4px 10px",
                              backgroundColor: `${roleInfo.color}20`,
                              fontSize: "12px",
                              fontWeight: 600,
                              color: roleInfo.color,
                            }}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleInfo.label}
                          </div>
                          {canManageTeam && member.role !== "owner" && (
                            <button
                              onClick={() => handleRemove(member.userId)}
                              disabled={removingId === member.userId}
                              className="flex items-center justify-center rounded-lg transition-colors"
                              style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                              }}
                            >
                              {removingId === member.userId ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2
                                  className="w-4 h-4"
                                  style={{ color: "#ef4444" }}
                                />
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Roles Legend */}
              <div
                className="rounded-xl"
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  backgroundColor: "var(--background-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  Role Permissions
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "12px",
                    color: "var(--foreground-muted)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" style={{ color: "#fbbf24" }} />
                    <span>
                      <strong>Owner</strong> - Full access, can manage team
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" style={{ color: "#8b5cf6" }} />
                    <span>
                      <strong>Editor</strong> - Can add/edit entries
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" style={{ color: "#06b6d4" }} />
                    <span>
                      <strong>Viewer</strong> - View only access
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
