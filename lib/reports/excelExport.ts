"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ReportData, CategorySummary } from "@/services/ReportsService";

export function exportToExcel(
  reportData: ReportData,
  categorySummary: CategorySummary[],
) {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ["Construction Budget Tracker - Report"],
    [""],
    ["Project Name:", reportData.projectName],
    ["Generated At:", new Date(reportData.generatedAt).toLocaleString()],
    ["Currency:", reportData.currency],
    [""],
    ["=== BUDGET SUMMARY ==="],
    ["Total Budget", reportData.totalBudget],
    ["Total Spent", reportData.totalSpent],
    ["Remaining", reportData.totalBudget - reportData.totalSpent],
    [""],
    ["=== CATEGORY BREAKDOWN ==="],
    ["Category", "Amount", "Count", "Percentage"],
    ...categorySummary.map((c) => [
      c.category,
      c.totalAmount,
      c.count,
      `${c.percentage.toFixed(1)}%`,
    ]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Clean column sizing for Summary
  summarySheet["!cols"] = [
    { wch: 25 }, // Labels (Project Name, Category)
    { wch: 15 }, // Values (Amount)
    { wch: 10 }, // Count
    { wch: 15 }, // Percentage
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Entries Sheet
  const entriesData = [
    [
      "Date",
      "Category",
      "Sub-Category",
      "Description",
      "Qty",
      "Unit Price",
      "Total Price",
    ],
    ...reportData.entries.flatMap((entry) =>
      (entry.items || []).map((item) => {
        const qty = item.qty ?? 1;
        const amount = item.amount || 0;
        return [
          entry.date,
          item.category || "",
          item.subCategory || "",
          item.description || "",
          qty,
          amount,
          qty * amount,
        ];
      }),
    ),
  ];
  const entriesSheet = XLSX.utils.aoa_to_sheet(entriesData);

  // Clean column sizing for Entries
  entriesSheet["!cols"] = [
    { wch: 15 }, // Date
    { wch: 20 }, // Category
    { wch: 20 }, // Sub-Category
    { wch: 40 }, // Description
    { wch: 8 }, // Qty
    { wch: 15 }, // Unit Price
    { wch: 15 }, // Total Price
  ];

  XLSX.utils.book_append_sheet(workbook, entriesSheet, "Entries");

  // Generate file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${reportData.projectName}-report.xlsx`);
}
