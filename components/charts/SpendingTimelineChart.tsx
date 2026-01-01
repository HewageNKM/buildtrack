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
import { BudgetEntry, CurrencyCode } from "@/types";
import { format, parseISO } from "date-fns";

interface SpendingTimelineChartProps {
  entries: BudgetEntry[];
  estimatedBudget: number;
  currency: CurrencyCode;
}

export default function SpendingTimelineChart({
  entries,
  estimatedBudget,
  currency,
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
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const containerClasses = "glass-card p-6 rounded-3xl";

  if (data.length === 0) {
    return (
      <div className={containerClasses}>
        <h3 className="text-lg font-bold mb-6 text-white">Spending Timeline</h3>
        <div className="h-64 flex flex-col items-center justify-center text-foreground-muted space-y-2">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-xl">📈</span>
          </div>
          <p className="text-sm font-medium">
            Add entries to see your spending trend
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <h3 className="text-lg font-bold mb-6 text-white">Spending Timeline</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.1)"
              opacity={0.5}
            />

            <XAxis
              dataKey="formattedDate"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />

            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />

            <Tooltip
              formatter={(value, name) => [
                formatCurrency(value as number),
                name === "cumulative" ? "Total Spent" : "Entry Amount",
              ]}
              contentStyle={{
                backgroundColor: "#030712", // midnight base
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.5)",
              }}
              itemStyle={{
                color: "#f8fafc",
                fontSize: "12px",
                fontWeight: "bold",
              }}
              labelStyle={{
                color: "#94a3b8",
                marginBottom: "4px",
                fontSize: "11px",
              }}
            />

            <ReferenceLine
              y={estimatedBudget}
              stroke="#f43f5e" // rose-500
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: "Budget Limit",
                fill: "#f43f5e",
                fontSize: 10,
                fontWeight: "bold",
                position: "insideBottomRight",
                dy: -5,
              }}
            />

            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#8b5cf6" // accent-violet
              strokeWidth={3}
              dot={{
                fill: "#8b5cf6",
                stroke: "#0f172a",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: "#8b5cf6",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
