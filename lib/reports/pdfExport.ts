"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData, CategorySummary } from "@/services/ReportsService";
import { logoBase64 } from "./logoBase64";
// custom fonts removed temporarily due to jsPDF parse crash
export function exportToPdf(
  reportData: ReportData,
  categorySummary: CategorySummary[],
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add Project Logo
  doc.addImage(logoBase64, "PNG", pageWidth / 2 - 10, 8, 20, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(reportData.projectName, pageWidth / 2, 36, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500

  let currentY = 44;

  doc.text(`Project ID: ${reportData.projectId}`, pageWidth / 2, currentY, {
    align: "center",
  });
  currentY += 5;

  doc.text(
    `Report Generated: ${new Date(reportData.generatedAt).toLocaleString()}`,
    pageWidth / 2,
    currentY,
    { align: "center" },
  );
  currentY += 5;

  if (reportData.dateRange) {
    doc.text(
      `Period: ${new Date(reportData.dateRange.start).toLocaleDateString()} to ${new Date(reportData.dateRange.end).toLocaleDateString()}`,
      pageWidth / 2,
      currentY,
      { align: "center" },
    );
    currentY += 5;
  }

  // Decorative line
  currentY += 3;
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(1);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 8;

  const formatCurrency = (val: number) =>
    `${reportData.currency} ${val.toLocaleString()}`;

  // Fluid Summary Cards
  const cards = [
    { label: "Total Budget", value: formatCurrency(reportData.totalBudget) },
    {
      label: "Total Released",
      value: formatCurrency(reportData.totalReleased),
    },
    { label: "Total Spent", value: formatCurrency(reportData.totalSpent) },
    {
      label: "Remaining",
      value: formatCurrency(reportData.totalBudget - reportData.totalSpent),
    },
  ];

  const cardSpacing = 4;
  const cardWidth =
    (pageWidth - 28 - cardSpacing * (cards.length - 1)) / cards.length;

  cards.forEach((card, index) => {
    const xPos = 14 + (cardWidth + cardSpacing) * index;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(xPos, currentY, cardWidth, 22, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, xPos + cardWidth / 2, currentY + 8, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(card.value, xPos + cardWidth / 2, currentY + 16, {
      align: "center",
    });
  });

  currentY += 32;

  // Category Breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Category Breakdown", 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [["Category", "Amount", "Count", "%"]],
    body: categorySummary.map((c) => [
      c.category,
      formatCurrency(c.totalAmount),
      c.count.toString(),
      `${c.percentage.toFixed(1)}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, font: "helvetica" },
    bodyStyles: { textColor: [51, 65, 85], fontSize: 10, font: "helvetica" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const afterCategory =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY || currentY + 50;

  // Entries Table Header
  if (afterCategory > 240) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = afterCategory + 15;
  }

  const entriesBody = reportData.entries.flatMap((entry) =>
    (entry.items || []).map((item) => [
      entry.date,
      item.category || "-",
      item.description || "-",
      (item.qty ?? 1).toString(),
      formatCurrency(item.amount || 0),
    ]),
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`Expense Entries (${entriesBody.length})`, 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [["Date", "Category", "Description", "Qty", "Unit Price"]],
    body: entriesBody.slice(0, 100),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, font: "helvetica" },
    bodyStyles: { textColor: [51, 65, 85], fontSize: 9, font: "helvetica" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  if (entriesBody.length > 100) {
    const afterEntries =
      (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY || 200;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `* Showing 100 of ${entriesBody.length} entries. Export to Excel for the complete dataset.`,
      14,
      afterEntries + 8,
    );
  }

  // Save
  doc.save(`${reportData.projectName.replace(/\\s+/g, "_")}_Report.pdf`);
}
