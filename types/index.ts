// TypeScript interfaces for the Construction Budget Tracker

import type { CurrencyCode } from "@/lib/currency";

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
  currency?: CurrencyCode; // Default: LKR
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "on-hold";
  createdAt: string;
  updatedAt: string;
  // Team collaboration
  teamMembers?: TeamMember[];
}

// Re-export currency types
export type { CurrencyCode } from "@/lib/currency";

export interface BudgetEntry {
  id: string;
  projectId: string;
  category: BudgetCategory;
  description: string;
  amount: number;
  date: string;
  invoiceUrl?: string;
  storagePath?: string;
  invoiceFileName?: string;
  invoiceType?: "image" | "pdf";
  createdAt: string;
  updatedAt: string;
  addedBy?: string; // User ID who added this entry
  subCategory?: string;
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

export const MATERIAL_TYPES = [
  // Cement & Aggregates
  {
    value: "cement_opc",
    label: "Ordinary Portland Cement (Sanstha/Tokyo/Holcim)",
  },
  { value: "cement_white", label: "White Cement" },
  { value: "sand_river", label: "River Sand (Sudhu Weli)" },
  { value: "sand_m", label: "M Sand (Manufactured Sand)" },
  { value: "metal_10mm", label: "10mm Metal (Chips / Chip Gal)" },
  { value: "metal_12mm", label: "12mm Metal" },
  { value: "metal_19mm", label: '19mm / 3/4" Metal (Concrete Metal)' },
  { value: "metal_abc", label: "ABC (Aggregate Base Course)" },
  { value: "rubble", label: "Rubble / Foundation Stone (6x9)" },
  { value: "gravel", label: "Gravel (Bora)" },

  // Bricks & Blocks
  { value: "bricks_clay", label: "Clay Bricks (Gadol)" },
  { value: "blocks_cement_solid", label: "Cement Blocks (Solid)" },
  { value: "blocks_cement_hollow", label: "Cement Blocks (Hollow)" },
  { value: "blocks_cabook", label: "Cabook / Laterite" },

  // Steel & Metal Works
  { value: "steel_tor_10", label: "10mm Tor Steel" },
  { value: "steel_tor_12", label: "12mm Tor Steel" },
  { value: "steel_tor_16", label: "16mm Tor Steel" },
  { value: "steel_tor_20", label: "20mm Tor Steel" },
  { value: "steel_mild", label: "Mild Steel Round Bars" },
  { value: "wire_mesh", label: "BRC / Wire Mesh" },
  { value: "binding_wire", label: "Binding Wire" },
  { value: "gi_pipes", label: "GI Pipes/Box Bars" },

  // Roofing
  { value: "roofing_tiles_calicut", label: "Roofing Tiles (Calicut)" },
  { value: "roofing_asbestos", label: "Asbestos Sheets" },
  { value: "roofing_zincalum", label: "Zinc Alum Sheets" },
  { value: "wood_roofing", label: "Roofing Timber (Kempas/Tualang)" },
  { value: "ceiling_sheets", label: "Ceiling Sheets (Asbestos/Smartboard)" },

  // Finishes
  { value: "tiles_floor", label: "Floor Tiles (Ceramic/Porcelain)" },
  { value: "tiles_wall", label: "Wall Tiles" },
  { value: "granite", label: "Granite" },
  { value: "paints_emulsion", label: "Emulsion Paint (Internal)" },
  { value: "paints_weather", label: "Weather Shield (External)" },
  { value: "paints_wood", label: "Wood Stain / Varnish" },
  { value: "putty", label: "Wall Putty / Filler" },

  // Plumbing
  { value: "pipes_pvc", label: "PVC Pipes (Type 600/1000)" },
  { value: "fittings_pvc", label: "PVC Fittings" },
  { value: "valves_taps", label: "Taps & Valves" },
  { value: "water_tank", label: "Water Tank" },
  { value: "sanitary_ware", label: "Sanitary Ware (Commode/Basin)" },

  // Electrical
  { value: "conduit_pvc", label: "PVC Conduit" },
  { value: "wires_cables", label: "Wires & Cables" },
  { value: "switches_sockets", label: "Switches & Sockets" },
  { value: "mcb_rccb", label: "MCB / RCCB (Trip Switch)" },
  { value: "light_fittings", label: "Light Fittings" },

  // Joinery
  { value: "frames_door_window", label: "Door/Window Frames (Jack/Teak)" },
  { value: "sashes", label: "Sashes" },
  { value: "glass", label: "Glass" },

  { value: "other", label: "Other Materials" },
];

export interface BudgetRelease {
  id: string;
  projectId: string;
  amount: number;
  note?: string; // e.g., "Phase 1 Mobilization"
  date: string;
  createdAt: string;
  createdBy: string; // User ID
}

export interface ProjectWithStats extends Project {
  totalSpent: number;
  totalReleased: number; // New field for released funds
  entryCount: number;
}
