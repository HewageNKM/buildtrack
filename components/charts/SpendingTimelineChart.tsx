"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { BudgetEntry } from "@/types";
import { format, parseISO } from "date-fns";

interface SpendingTimelineChartProps {
  entries: BudgetEntry[];
  estimatedBudget: number;
}

export default function SpendingTimelineChart({
  entries,
  estimatedBudget,
}: SpendingTimelineChartProps) {
  // Sort entries by date and calculate cumulative spending
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data = sortedEntries.reduce<
    {
      date: string;
      formattedDate: string;
      amount: number;
      cumulative: number;
    }[]
  >((acc, entry) => {
    const prevCumulative = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({
      date: entry.date,
      formattedDate: format(parseISO(entry.date), "MMM dd"),
      amount: entry.amount,
      cumulative: prevCumulative + entry.amount,
    });
    return acc;
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Spending Timeline</h3>
        <div className="h-64 flex items-center justify-center text-foreground-muted">
          No entries yet
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Spending Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(value as number),
                name === "cumulative" ? "Total Spent" : "Entry Amount",
              ]}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <ReferenceLine
              y={estimatedBudget}
              stroke="var(--error)"
              strokeDasharray="5 5"
              label={{
                value: "Budget",
                fill: "var(--error)",
                fontSize: 12,
                position: "right",
              }}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: "var(--primary)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "var(--primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
