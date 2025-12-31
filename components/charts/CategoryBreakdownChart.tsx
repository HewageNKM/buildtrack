"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { BUDGET_CATEGORIES, BudgetEntry, CurrencyCode } from "@/types";

interface CategoryBreakdownChartProps {
  entries: BudgetEntry[];
  currency: CurrencyCode;
}

export default function CategoryBreakdownChart({
  entries,
  currency,
}: CategoryBreakdownChartProps) {
  // Aggregate spending by category
  const categoryTotals = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = BUDGET_CATEGORIES.filter(
    (cat) => categoryTotals[cat.value] > 0
  ).map((cat) => ({
    name: cat.label,
    value: categoryTotals[cat.value] || 0,
    color: cat.color,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        <div className="h-64 flex items-center justify-center text-foreground-muted">
          No entries yet
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => (
                <span
                  style={{ color: "var(--foreground-muted)", fontSize: "12px" }}
                >
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
