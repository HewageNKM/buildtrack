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
import { Card, Typography } from "antd";

const { Title } = Typography;

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

  return (
    <Card style={{ height: "100%" }} className="shadow-sm">
      <Title level={4} style={{ marginBottom: 24 }}>
        Budget Overview
      </Title>
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
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis type="category" dataKey="name" hide />

            <Tooltip
              cursor={{ fill: "transparent" }}
              formatter={(value) => formatValue(value as number)}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              labelStyle={{ display: "none" }}
            />

            <Legend
              verticalAlign="bottom"
              align="left"
              wrapperStyle={{ paddingTop: "24px" }}
            />

            <Bar
              dataKey="Estimated"
              fill="#8b5cf6"
              radius={[0, 4, 4, 0]}
              barSize={32}
            />
            <Bar
              dataKey="Spent"
              fill="#06b6d4"
              radius={[0, 4, 4, 0]}
              barSize={32}
            />
            {overBudget > 0 && (
              <Bar
                dataKey="Over Budget"
                fill="#ff4d4f"
                radius={[0, 4, 4, 0]}
                barSize={32}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
