import { EntryRepository } from "@/repositories/EntryRepository";
import { ProjectService } from "./ProjectService";
import { BudgetEntry } from "@/types";

export type ApprovalAction = "approve" | "reject";

export interface ApprovalResult {
  success: boolean;
  entry: BudgetEntry;
  message: string;
}

export class ApprovalService {
  private entryRepo: EntryRepository;
  private projectService: ProjectService;

  constructor() {
    this.entryRepo = new EntryRepository();
    this.projectService = new ProjectService();
  }

  /**
   * Approve or reject an entry
   */
  async processApproval(
    projectId: string,
    entryId: string,
    userId: string,
    email: string | undefined,
    action: ApprovalAction,
    rejectionReason?: string
  ): Promise<ApprovalResult> {
    // Verify user has access and appropriate role
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) {
      throw new Error("Access denied");
    }

    // Only owner or editor can approve
    if (access.role !== "owner" && access.role !== "editor") {
      throw new Error("Only owners or editors can approve expenses");
    }

    // Get the entry (BaseRepository.getById takes single ID)
    const entry = await this.entryRepo.getById(entryId);
    if (!entry || entry.projectId !== projectId) {
      throw new Error("Entry not found");
    }

    // Update approval status
    const updateData: Partial<BudgetEntry> = {
      approvalStatus: action === "approve" ? "approved" : "rejected",
      approvedBy: userId,
      approvalDate: new Date().toISOString(),
    };

    if (action === "reject" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updated = await this.entryRepo.update(entryId, updateData);

    return {
      success: true,
      entry: updated,
      message:
        action === "approve" ? "Entry approved successfully" : "Entry rejected",
    };
  }

  /**
   * Get entries pending approval for a project
   */
  async getPendingApprovals(
    projectId: string,
    userId: string,
    email?: string
  ): Promise<BudgetEntry[]> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) {
      throw new Error("Access denied");
    }

    const entries = await this.entryRepo.getByProjectId(projectId);
    return entries.filter(
      (e) => e.approvalStatus === "pending" || !e.approvalStatus
    );
  }

  /**
   * Get approval statistics for a project
   */
  async getApprovalStats(
    projectId: string,
    userId: string,
    email?: string
  ): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) {
      throw new Error("Access denied");
    }

    const entries = await this.entryRepo.getByProjectId(projectId);

    return {
      pending: entries.filter(
        (e) => e.approvalStatus === "pending" || !e.approvalStatus
      ).length,
      approved: entries.filter((e) => e.approvalStatus === "approved").length,
      rejected: entries.filter((e) => e.approvalStatus === "rejected").length,
      total: entries.length,
    };
  }
}
