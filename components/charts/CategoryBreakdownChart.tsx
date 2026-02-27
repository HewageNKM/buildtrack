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
import { CurrencyCode } from "@/types";
import { Card, Empty, Typography } from "antd";

const { Title } = Typography;

interface CategoryBreakdownChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  currency: CurrencyCode;
}

export default function CategoryBreakdownChart({
  data,
  currency,
}: CategoryBreakdownChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (data.length === 0) {
    return (
      <Card style={{ height: "100%" }} className="shadow-sm">
        <Title level={4} style={{ marginBottom: 24 }}>
          Spending by Category
        </Title>
        <div className="h-64 flex flex-col items-center justify-center">
          <Empty
            description="No expenses recorded yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ height: "100%" }} className="shadow-sm">
      <Title level={4} style={{ marginBottom: 24 }}>
        Spending by Category
      </Title>
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
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />

            <Legend
              layout={isMobile ? "horizontal" : "vertical"}
              align={isMobile ? "center" : "right"}
              verticalAlign={isMobile ? "bottom" : "middle"}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingLeft: isMobile ? "0px" : "20px",
                paddingTop: isMobile ? "20px" : "0px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
