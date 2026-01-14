"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ProjectCategory, BudgetEntry, CurrencyCode } from "@/types";

interface CategoryBreakdownChartProps {
  entries: BudgetEntry[];
  currency: CurrencyCode;
  categories: ProjectCategory[];
}

export default function CategoryBreakdownChart({
  entries,
  currency,
  categories,
}: CategoryBreakdownChartProps) {
  // Aggregate spending by category
  const categoryTotals = entries.reduce((acc, entry) => {
    // entry.category might be a slug (legacy) or a Name (new)
    // We normalize to lowercase for aggregation if we want?
    // Actually, better to map everything to the Category ID or Name defined in ProjectCategory.

    // Find the matching ProjectCategory
    // Check if entry.category matches a cat.slug or cat.name
    // (assuming entry.category is the string value stored)

    const cat = categories.find(
      (c) =>
        c.type === "category" &&
        (c.name === entry.category ||
          c.slug === entry.category ||
          c.name.toLowerCase() === entry.category.toLowerCase())
    );

    const key = cat ? cat.name : entry.category; // Group by standardized Name, fall back to entry value
    acc[key] = (acc[key] || 0) + entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = categories
    .filter((cat) => cat.type === "category")
    .map((cat) => ({
      name: cat.name,
      value: categoryTotals[cat.name] || 0,
      color: cat.color || "#ccc",
    }))
    .filter((d) => d.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Responsive Legend state
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Common container classes to replace .card
  const containerClasses = "glass-card p-6 rounded-3xl";

  if (data.length === 0) {
    return (
      <div className={containerClasses}>
        <h3 className="text-lg font-bold mb-4 text-white">
          Spending by Category
        </h3>
        <div className="h-64 flex flex-col items-center justify-center text-foreground-muted space-y-2">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <p className="text-sm font-medium">No expenses recorded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <h3 className="text-lg font-bold mb-6 text-white">
        Spending by Category
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx={isMobile ? "50%" : "40%"}
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity outline-none"
                  style={{ filter: "drop-shadow(0px 0px 4px rgba(0,0,0,0.2))" }}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "var(--shadow-glow)",
              }}
              itemStyle={{
                color: "var(--foreground)",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            />

            <Legend
              layout={isMobile ? "horizontal" : "vertical"}
              align={isMobile ? "center" : "right"}
              verticalAlign={isMobile ? "bottom" : "middle"}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs font-semibold text-foreground-muted ml-2 mr-2">
                  {value}
                </span>
              )}
              wrapperStyle={{
                paddingLeft: isMobile ? "0px" : "20px",
                paddingTop: isMobile ? "20px" : "0px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
