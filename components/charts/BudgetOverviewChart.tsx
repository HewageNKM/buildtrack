"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CurrencyCode } from "@/types";
import { formatCurrency } from "@/lib/currency";

interface BudgetOverviewChartProps {
  estimatedBudget: number;
  totalSpent: number;
  currency: CurrencyCode;
}

export default function BudgetOverviewChart({
  estimatedBudget,
  totalSpent,
  currency,
}: BudgetOverviewChartProps) {
  const estimated = estimatedBudget || 0;
  const spent = totalSpent || 0;
  const overBudget = Math.max(0, spent - estimated);
  const spentWithinBudget = Math.min(spent, estimated);

  // Data for the chart
  const data = [
    {
      name: "Budget vs Spent",
      Estimated: estimated,
      Spent: spentWithinBudget,
      "Over Budget": overBudget,
    },
  ];

  const formatValue = (val: number) => formatCurrency(val, currency);

  const containerClasses = "glass-card p-6 rounded-3xl";

  return (
    <div className={containerClasses}>
      <h3 className="text-lg font-bold mb-6 text-white">Budget Overview</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            barGap={8}
          >
            <XAxis
              type="number"
              tickFormatter={formatValue}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis type="category" dataKey="name" hide />

            <Tooltip
              cursor={{ fill: "transparent" }}
              formatter={(value) => formatValue(value as number)}
              contentStyle={{
                backgroundColor: "#030712", // midnight base
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "16px",
                color: "#f8fafc",
                boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.5)",
              }}
              itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
              labelStyle={{ display: "none" }}
            />

            <Legend
              verticalAlign="bottom"
              align="left"
              wrapperStyle={{
                paddingTop: "24px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            />

            <Bar
              dataKey="Estimated"
              fill="#8b5cf6" // accent-violet
              radius={[0, 6, 6, 0]}
              barSize={32}
            />
            <Bar
              dataKey="Spent"
              fill="#06b6d4" // accent-cyan
              radius={[0, 6, 6, 0]}
              barSize={32}
            />
            {overBudget > 0 && (
              <Bar
                dataKey="Over Budget"
                fill="#f43f5e" // rose-500
                radius={[0, 6, 6, 0]}
                barSize={32}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
