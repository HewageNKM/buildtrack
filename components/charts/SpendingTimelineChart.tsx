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
import { Card, Empty, Typography } from "antd";

const { Title } = Typography;

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

  if (data.length === 0) {
    return (
      <Card style={{ height: "100%" }} className="shadow-sm">
        <Title level={4} style={{ marginBottom: 24 }}>
          Spending Timeline
        </Title>
        <div className="h-64 flex flex-col items-center justify-center">
          <Empty
            description="Add entries to see your spending trend"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ height: "100%" }} className="shadow-sm">
      <Title level={4} style={{ marginBottom: 24 }}>
        Spending Timeline
      </Title>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
              opacity={0.5}
            />

            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />

            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11 }}
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
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />

            <ReferenceLine
              y={estimatedBudget}
              stroke="#ff4d4f"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: "Budget Limit",
                fill: "#ff4d4f",
                fontSize: 10,
                fontWeight: "bold",
                position: "insideBottomRight",
                dy: -5,
              }}
            />

            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{
                fill: "#8b5cf6",
                stroke: "#fff",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: "#8b5cf6",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
