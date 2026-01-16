import { EntryRepository } from "@/repositories/EntryRepository";
import { ProjectService } from "./ProjectService";
import { BudgetEntry } from "@/types";

export interface ReportData {
  projectId: string;
  projectName: string;
  currency: string;
  totalBudget: number;
  totalSpent: number;
  totalReleased: number;
  entries: BudgetEntry[];
  generatedAt: string;
  dateRange?: { start: string; end: string };
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export class ReportsService {
  private entryRepo: EntryRepository;
  private projectService: ProjectService;

  constructor() {
    this.entryRepo = new EntryRepository();
    this.projectService = new ProjectService();
  }

  async getReportData(
    projectId: string,
    userId: string,
    email?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ReportData> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");

    const project = await this.projectService.getProject(
      projectId,
      userId,
      email
    );
    if (!project) throw new Error("Project not found");

    const entries = await this.entryRepo.getByProjectId(
      projectId,
      undefined,
      undefined,
      startDate,
      endDate
    );

    const totalSpent = entries.reduce((sum, e) => sum + (e.amount || 0), 0);

    return {
      projectId,
      projectName: project.name,
      currency: project.currency || "LKR",
      totalBudget: project.estimatedBudget,
      totalSpent,
      totalReleased: 0, // TODO: Get from releases
      entries,
      generatedAt: new Date().toISOString(),
      dateRange:
        startDate && endDate ? { start: startDate, end: endDate } : undefined,
    };
  }

  getCategorySummary(entries: BudgetEntry[]): CategorySummary[] {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    entries.forEach((entry) => {
      const items = entry.items || [];
      items.forEach((item) => {
        const cat = item.category || "Uncategorized";
        const current = categoryMap.get(cat) || { amount: 0, count: 0 };
        categoryMap.set(cat, {
          amount: current.amount + (item.amount || 0),
          count: current.count + 1,
        });
      });
    });

    const totalAmount = Array.from(categoryMap.values()).reduce(
      (sum, v) => sum + v.amount,
      0
    );

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        totalAmount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }
}
