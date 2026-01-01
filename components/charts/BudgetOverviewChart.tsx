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

import { CurrencyCode } from "@/types";

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
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="glass-card p-6 rounded-3xl">
      <h3 className="text-lg font-bold mb-6 text-white">Budget vs. Spending</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="rgba(255,255,255,0.1)"
              opacity={0.5}
            />

            <XAxis
              type="number"
              tickFormatter={formatCurrency}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis type="category" dataKey="name" hide />

            <Tooltip
              cursor={{ fill: "transparent" }}
              formatter={(value) => formatCurrency(value as number)}
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
