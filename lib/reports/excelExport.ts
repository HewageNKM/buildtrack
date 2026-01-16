"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ReportData, CategorySummary } from "@/services/ReportsService";

export function exportToExcel(
  reportData: ReportData,
  categorySummary: CategorySummary[]
) {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ["Project Report"],
    [""],
    ["Project Name", reportData.projectName],
    ["Generated At", new Date(reportData.generatedAt).toLocaleString()],
    [""],
    ["Budget Summary"],
    ["Total Budget", reportData.totalBudget],
    ["Total Spent", reportData.totalSpent],
    ["Remaining", reportData.totalBudget - reportData.totalSpent],
    [""],
    ["Category Breakdown"],
    ["Category", "Amount", "Count", "Percentage"],
    ...categorySummary.map((c) => [
      c.category,
      c.totalAmount,
      c.count,
      `${c.percentage.toFixed(1)}%`,
    ]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Entries Sheet
  const entriesData = [
    ["Date", "Category", "Sub-Category", "Description", "Amount"],
    ...reportData.entries.flatMap((entry) =>
      (entry.items || []).map((item) => [
        entry.date,
        item.category || "",
        item.subCategory || "",
        item.description || "",
        item.amount || 0,
      ])
    ),
  ];
  const entriesSheet = XLSX.utils.aoa_to_sheet(entriesData);
  XLSX.utils.book_append_sheet(workbook, entriesSheet, "Entries");

  // Generate file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${reportData.projectName}-report.xlsx`);
}
