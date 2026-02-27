import { EntryRepository } from "@/repositories/EntryRepository";
import { ProjectService } from "./ProjectService";
import { BudgetEntry, ProjectCategory } from "@/types";

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
  children?: CategorySummary[]; // Subcategories
}

export interface AnalyticsData {
  categoryBreakdown: { name: string; value: number; color?: string }[];
  timeline: {
    date: string;
    formattedDate: string;
    amount: number;
    cumulative: number;
  }[];
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
    endDate?: string,
  ): Promise<ReportData> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email,
    );
    if (!access.hasAccess) throw new Error("Access denied");

    const project = await this.projectService.getProject(
      projectId,
      userId,
      email,
    );
    if (!project) throw new Error("Project not found");

    const entries = await this.entryRepo.getByProjectId(
      projectId,
      undefined,
      undefined,
      startDate,
      endDate,
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
    // Map: category -> { amount, count, subcategories }
    const categoryMap = new Map<
      string,
      {
        amount: number;
        count: number;
        subcategories: Map<string, { amount: number; count: number }>;
      }
    >();

    entries.forEach((entry) => {
      const items = entry.items || [];
      items.forEach((item) => {
        const cat = item.category || "Uncategorized";
        const subCat = item.subCategory;

        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, {
            amount: 0,
            count: 0,
            subcategories: new Map(),
          });
        }

        const catData = categoryMap.get(cat)!;
        const itemTotal = (item.amount || 0) * (item.qty ?? 1);
        catData.amount += itemTotal;
        catData.count += 1;

        // Track subcategory if exists
        if (subCat) {
          const subData = catData.subcategories.get(subCat) || {
            amount: 0,
            count: 0,
          };
          catData.subcategories.set(subCat, {
            amount: subData.amount + itemTotal,
            count: subData.count + 1,
          });
        }
      });
    });

    const totalAmount = Array.from(categoryMap.values()).reduce(
      (sum, v) => sum + v.amount,
      0,
    );

    return Array.from(categoryMap.entries())
      .map(([category, data]) => {
        const children =
          data.subcategories.size > 0
            ? Array.from(data.subcategories.entries())
                .map(([subCategory, subData]) => ({
                  category: subCategory,
                  totalAmount: subData.amount,
                  count: subData.count,
                  percentage:
                    data.amount > 0 ? (subData.amount / data.amount) * 100 : 0,
                }))
                .sort((a, b) => b.totalAmount - a.totalAmount)
            : undefined;

        return {
          category,
          totalAmount: data.amount,
          count: data.count,
          percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
          children,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  getAnalyticsData(
    entries: BudgetEntry[],
    categories: ProjectCategory[],
  ): AnalyticsData {
    // 1. Category Breakdown
    const categoryTotals = entries.reduce(
      (acc, entry) => {
        const items = entry.items || [];
        items.forEach((item) => {
          if (!item.category) return;
          const categoryName = item.category;

          const cat = categories.find(
            (c) =>
              c.type === "category" &&
              (c.name === categoryName ||
                c.slug === categoryName ||
                c.name.toLowerCase() === categoryName.toLowerCase()),
          );

          const key = cat ? cat.name : categoryName;
          const itemTotal = (item.amount || 0) * (item.qty ?? 1);
          // The item amount is the unit price, multiply by qty
          acc[key] = (acc[key] || 0) + itemTotal;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const categoryBreakdown = categories
      .filter((cat) => cat.type === "category")
      .map((cat) => ({
        name: cat.name,
        value: categoryTotals[cat.name] || 0,
        color: cat.color || "#ccc",
      }))
      .filter((d) => d.value > 0);

    // 2. Spending Timeline
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const timeline = sortedEntries.reduce<
      {
        date: string;
        formattedDate: string;
        amount: number;
        cumulative: number;
      }[]
    >((acc, entry) => {
      const existingDay = acc.find((d) => d.date === entry.date);

      if (existingDay) {
        existingDay.amount += entry.amount;
        const dayIndex = acc.indexOf(existingDay);
        for (let i = dayIndex; i < acc.length; i++) {
          acc[i].cumulative += entry.amount;
        }
      } else {
        const prevCumulative =
          acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
        acc.push({
          date: entry.date,
          // We don't import date-fns here to keep it simple, format string manually
          // or we can use standard JS formatting
          formattedDate: new Date(entry.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          amount: entry.amount,
          cumulative: prevCumulative + entry.amount,
        });
      }

      return acc;
    }, []);

    return { categoryBreakdown, timeline };
  }
}
