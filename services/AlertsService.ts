import { ProjectService } from "./ProjectService";
import { BudgetAlert, ProjectWithStats } from "@/types";

export interface AlertCheckResult {
  alerts: BudgetAlert[];
  hasWarnings: boolean;
  hasCriticals: boolean;
}

export interface AlertThresholds {
  nearThreshold: number; // e.g., 80%
  criticalThreshold: number; // e.g., 100%
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  nearThreshold: 80,
  criticalThreshold: 100,
};

export class AlertsService {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  /**
   * Check a single project for budget alerts
   */
  checkProjectAlerts(
    project: ProjectWithStats,
    thresholds: AlertThresholds = DEFAULT_THRESHOLDS
  ): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];
    const { estimatedBudget, totalSpent, totalReleased } = project;

    if (estimatedBudget <= 0) return alerts;

    const spentPercentage = (totalSpent / estimatedBudget) * 100;

    // Critical: Over budget
    if (spentPercentage >= thresholds.criticalThreshold) {
      alerts.push({
        id: `${project.id}-over-budget`,
        projectId: project.id,
        type: "over_budget",
        message: `"${project.name}" has exceeded budget by ${(
          spentPercentage - 100
        ).toFixed(1)}%`,
        threshold: thresholds.criticalThreshold,
        currentValue: spentPercentage,
        severity: "critical",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
    // Warning: Near threshold
    else if (spentPercentage >= thresholds.nearThreshold) {
      alerts.push({
        id: `${project.id}-near-threshold`,
        projectId: project.id,
        type: "near_threshold",
        message: `"${project.name}" has used ${spentPercentage.toFixed(
          1
        )}% of budget`,
        threshold: thresholds.nearThreshold,
        currentValue: spentPercentage,
        severity: "warning",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Info: Release needed (spent approaching released funds)
    if (totalReleased > 0 && totalSpent >= totalReleased * 0.9) {
      alerts.push({
        id: `${project.id}-release-needed`,
        projectId: project.id,
        type: "release_needed",
        message: `"${project.name}" may need additional fund release`,
        threshold: 90,
        currentValue: (totalSpent / totalReleased) * 100,
        severity: totalSpent >= totalReleased ? "warning" : "info",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return alerts;
  }

  /**
   * Check all projects for a user and return aggregated alerts
   */
  async checkAllProjectAlerts(
    userId: string,
    thresholds: AlertThresholds = DEFAULT_THRESHOLDS
  ): Promise<AlertCheckResult> {
    const { owned, shared } = await this.projectService.getProjects(userId);
    const projects = [...owned, ...shared];
    const allAlerts: BudgetAlert[] = [];

    for (const project of projects) {
      const projectAlerts = this.checkProjectAlerts(project, thresholds);
      allAlerts.push(...projectAlerts);
    }

    // Sort by severity (critical first, then warning, then info)
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    allAlerts.sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );

    return {
      alerts: allAlerts,
      hasWarnings: allAlerts.some(
        (a) => a.severity === "warning" || a.severity === "critical"
      ),
      hasCriticals: allAlerts.some((a) => a.severity === "critical"),
    };
  }

  /**
   * Get summary statistics for dashboard
   */
  getAlertSummary(alerts: BudgetAlert[]): {
    critical: number;
    warning: number;
    info: number;
    total: number;
  } {
    return {
      critical: alerts.filter((a) => a.severity === "critical").length,
      warning: alerts.filter((a) => a.severity === "warning").length,
      info: alerts.filter((a) => a.severity === "info").length,
      total: alerts.length,
    };
  }
}
