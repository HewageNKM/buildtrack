// TypeScript interfaces for the Construction Budget Tracker

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export type TeamMemberRole = "owner" | "editor" | "viewer";

export interface TeamMember {
  userId: string;
  email: string;
  displayName?: string;
  role: TeamMemberRole;
  joinedAt: string;
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  projectName: string;
  invitedEmail: string;
  invitedBy: string;
  invitedByName: string;
  role: TeamMemberRole;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string; // Owner's ID
  name: string;
  description: string;
  estimatedBudget: number;
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "on-hold";
  createdAt: string;
  updatedAt: string;
  // Team collaboration
  teamMembers?: TeamMember[];
}

export interface BudgetEntry {
  id: string;
  projectId: string;
  category: BudgetCategory;
  description: string;
  amount: number;
  date: string;
  invoiceUrl?: string;
  invoiceFileName?: string;
  invoiceType?: "image" | "pdf";
  createdAt: string;
  updatedAt: string;
  addedBy?: string; // User ID who added this entry
}

export type BudgetCategory =
  | "materials"
  | "labor"
  | "equipment"
  | "permits"
  | "subcontractor"
  | "utilities"
  | "transportation"
  | "miscellaneous";

export const BUDGET_CATEGORIES: {
  value: BudgetCategory;
  label: string;
  color: string;
}[] = [
  { value: "materials", label: "Materials", color: "#3B82F6" },
  { value: "labor", label: "Labor", color: "#10B981" },
  { value: "equipment", label: "Equipment", color: "#F59E0B" },
  { value: "permits", label: "Permits & Fees", color: "#8B5CF6" },
  { value: "subcontractor", label: "Subcontractor", color: "#EC4899" },
  { value: "utilities", label: "Utilities", color: "#06B6D4" },
  { value: "transportation", label: "Transportation", color: "#84CC16" },
  { value: "miscellaneous", label: "Miscellaneous", color: "#6B7280" },
];

export interface ProjectWithStats extends Project {
  totalSpent: number;
  entryCount: number;
}
