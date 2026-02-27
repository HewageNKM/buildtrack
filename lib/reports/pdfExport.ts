"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData, CategorySummary } from "@/services/ReportsService";
import { NotoSansBase64 } from "./notoSansBase64";

export function exportToPdf(
  reportData: ReportData,
  categorySummary: CategorySummary[],
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Handle Unicode font
  doc.addFileToVFS("NotoSans-Regular.ttf", NotoSansBase64);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans", "normal");

  // Header Style
  doc.setFontSize(24);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(reportData.projectName, pageWidth / 2, 30, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(
    `Report Generated: ${new Date(reportData.generatedAt).toLocaleString()}`,
    pageWidth / 2,
    42,
    { align: "center" },
  );

  // Decorative line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(1);
  doc.line(14, 52, pageWidth - 14, 52);

  // Budget Summary Box
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text("Budget Summary", 14, 75);

  const formatCurrency = (val: number) =>
    `${reportData.currency} ${val.toLocaleString()}`;

  autoTable(doc, {
    startY: 85,
    head: [["Metric", "Value"]],
    body: [
      ["Total Budget", formatCurrency(reportData.totalBudget)],
      ["Total Spent", formatCurrency(reportData.totalSpent)],
      [
        "Remaining",
        formatCurrency(reportData.totalBudget - reportData.totalSpent),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      halign: "left",
      fontStyle: "bold",
    },
    bodyStyles: { textColor: [51, 65, 85], fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    tableWidth: 250,
  });

  // Category Breakdown
  const afterSummary =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY || 110;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Category Breakdown", 14, afterSummary + 25);

  autoTable(doc, {
    startY: afterSummary + 35,
    head: [["Category", "Amount", "Count", "%"]],
    body: categorySummary.map((c) => [
      c.category,
      formatCurrency(c.totalAmount),
      c.count.toString(),
      `${c.percentage.toFixed(1)}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, font: "NotoSans" },
    bodyStyles: { textColor: [51, 65, 85], fontSize: 10, font: "NotoSans" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // Entries Table
  const afterCategory =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY || 150;

  if (afterCategory > 220) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Expense Entries", 14, 30);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Expense Entries", 14, afterCategory + 25);
  }

  const entriesStartY = afterCategory > 220 ? 40 : afterCategory + 35;

  const entriesBody = reportData.entries.flatMap((entry) =>
    (entry.items || []).map((item) => [
      entry.date,
      item.category || "-",
      item.description || "-",
      (item.qty ?? 1).toString(),
      formatCurrency(item.amount || 0),
    ]),
  );

  autoTable(doc, {
    startY: entriesStartY,
    head: [["Date", "Category", "Description", "Qty", "Unit Price"]],
    body: entriesBody.slice(0, 100), // Increased from 50 to 100 for PDF
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, font: "NotoSans" },
    bodyStyles: { textColor: [51, 65, 85], fontSize: 9, font: "NotoSans" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  if (entriesBody.length > 100) {
    const afterEntries =
      (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY || 200;
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text(
      `* Showing 100 of ${entriesBody.length} entries. Please export to Excel for the complete dataset.`,
      14,
      afterEntries + 15,
    );
  }

  // Save
  doc.save(`${reportData.projectName}-report.pdf`);
}
