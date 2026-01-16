"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData, CategorySummary } from "@/services/ReportsService";

export function exportToPdf(
  reportData: ReportData,
  categorySummary: CategorySummary[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text(reportData.projectName, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated: ${new Date(reportData.generatedAt).toLocaleString()}`,
    pageWidth / 2,
    28,
    { align: "center" }
  );

  // Budget Summary Box
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Budget Summary", 14, 45);

  const formatCurrency = (val: number) =>
    `${reportData.currency} ${val.toLocaleString()}`;

  autoTable(doc, {
    startY: 50,
    head: [["Metric", "Value"]],
    body: [
      ["Total Budget", formatCurrency(reportData.totalBudget)],
      ["Total Spent", formatCurrency(reportData.totalSpent)],
      [
        "Remaining",
        formatCurrency(reportData.totalBudget - reportData.totalSpent),
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14, right: 14 },
  });

  // Category Breakdown
  const afterSummary = (doc as any).lastAutoTable?.finalY || 80;
  doc.text("Category Breakdown", 14, afterSummary + 15);

  autoTable(doc, {
    startY: afterSummary + 20,
    head: [["Category", "Amount", "Count", "%"]],
    body: categorySummary.map((c) => [
      c.category,
      formatCurrency(c.totalAmount),
      c.count.toString(),
      `${c.percentage.toFixed(1)}%`,
    ]),
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14, right: 14 },
  });

  // Entries Table
  const afterCategory = (doc as any).lastAutoTable?.finalY || 120;

  if (afterCategory > 240) {
    doc.addPage();
    doc.text("Expense Entries", 14, 20);
  } else {
    doc.text("Expense Entries", 14, afterCategory + 15);
  }

  const entriesStartY = afterCategory > 240 ? 25 : afterCategory + 20;

  const entriesBody = reportData.entries.flatMap((entry) =>
    (entry.items || []).map((item) => [
      entry.date,
      item.category || "-",
      item.description || "-",
      formatCurrency(item.amount || 0),
    ])
  );

  autoTable(doc, {
    startY: entriesStartY,
    head: [["Date", "Category", "Description", "Amount"]],
    body: entriesBody.slice(0, 50), // Limit for PDF
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8 },
  });

  if (entriesBody.length > 50) {
    const afterEntries = (doc as any).lastAutoTable?.finalY || 200;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Showing 50 of ${entriesBody.length} entries. Export to Excel for full data.`,
      14,
      afterEntries + 10
    );
  }

  // Save
  doc.save(`${reportData.projectName}-report.pdf`);
}
