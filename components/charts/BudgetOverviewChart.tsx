"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BudgetOverviewChartProps {
  estimatedBudget: number;
  totalSpent: number;
}

export default function BudgetOverviewChart({
  estimatedBudget,
  totalSpent,
}: BudgetOverviewChartProps) {
  const remaining = Math.max(estimatedBudget - totalSpent, 0);
  const overBudget = Math.max(totalSpent - estimatedBudget, 0);

  const data = [
    {
      name: "Budget",
      Estimated: estimatedBudget,
      Spent: totalSpent,
      Remaining: remaining,
      "Over Budget": overBudget,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              tickFormatter={formatCurrency}
              tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
              hide
            />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar dataKey="Estimated" fill="#3b82f6" radius={[4, 4, 4, 4]} />
            <Bar dataKey="Spent" fill="#f97316" radius={[4, 4, 4, 4]} />
            {overBudget > 0 && (
              <Bar dataKey="Over Budget" fill="#ef4444" radius={[4, 4, 4, 4]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
