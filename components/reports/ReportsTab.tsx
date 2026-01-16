"use client";

import { useState } from "react";
import {
  Card,
  Button,
  DatePicker,
  Space,
  Spin,
  Typography,
  Statistic,
  Row,
  Col,
  Table,
  Progress,
  message,
} from "antd";
import {
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { api } from "@/lib/api";
import { exportToPdf } from "@/lib/reports/pdfExport";
import { exportToExcel } from "@/lib/reports/excelExport";
import type { ReportData, CategorySummary } from "@/services/ReportsService";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface ReportsTabProps {
  projectId: string;
  currency?: string;
}

export default function ReportsTab({
  projectId,
  currency = "LKR",
}: ReportsTabProps) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0]?.format("YYYY-MM-DD");
      const endDate = dateRange[1]?.format("YYYY-MM-DD");
      const response = await api.reports.getReportData(
        projectId,
        startDate,
        endDate
      );
      setReportData(response.reportData);
      setCategorySummary(response.categorySummary);
    } catch {
      message.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (!reportData) return;
    exportToPdf(reportData, categorySummary);
    message.success("PDF exported successfully");
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    exportToExcel(reportData, categorySummary);
    message.success("Excel exported successfully");
  };

  const categoryColumns: ColumnsType<CategorySummary> = [
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (val) => `${currency} ${val.toLocaleString()}`,
    },
    { title: "Count", dataIndex: "count", key: "count" },
    {
      title: "Share",
      dataIndex: "percentage",
      key: "percentage",
      render: (val) => (
        <Progress
          percent={val}
          size="small"
          format={(p) => `${p?.toFixed(1)}%`}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Controls */}
      <Space style={{ marginBottom: 16 }} wrap>
        <RangePicker
          value={dateRange}
          onChange={(dates) =>
            setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])
          }
        />
        <Button type="primary" onClick={fetchReport} loading={loading}>
          Generate Report
        </Button>
        {reportData && (
          <>
            <Button icon={<FilePdfOutlined />} onClick={handleExportPdf}>
              Export PDF
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              Export Excel
            </Button>
          </>
        )}
      </Space>

      {/* Report Content */}
      <Spin spinning={loading}>
        {reportData ? (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Summary Cards */}
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Budget"
                    value={reportData.totalBudget}
                    prefix={currency}
                    valueStyle={{ color: "#6366f1" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Spent"
                    value={reportData.totalSpent}
                    prefix={currency}
                    valueStyle={{ color: "#10b981" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Remaining"
                    value={reportData.totalBudget - reportData.totalSpent}
                    prefix={currency}
                    valueStyle={{
                      color:
                        reportData.totalBudget - reportData.totalSpent < 0
                          ? "#ef4444"
                          : "#f59e0b",
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Category Breakdown */}
            <Card
              title={
                <Space>
                  <PieChartOutlined />
                  <span>Category Breakdown</span>
                </Space>
              }
            >
              <Table
                columns={categoryColumns}
                dataSource={categorySummary}
                rowKey="category"
                pagination={false}
                size="small"
              />
            </Card>

            {/* Entry Count */}
            <Text type="secondary">
              Report includes {reportData.entries.length} entries
              {reportData.dateRange &&
                ` from ${reportData.dateRange.start} to ${reportData.dateRange.end}`}
            </Text>
          </Space>
        ) : (
          <Card>
            <div style={{ textAlign: "center", padding: 40 }}>
              <DownloadOutlined style={{ fontSize: 48, color: "#ccc" }} />
              <Title level={4} style={{ marginTop: 16, color: "#888" }}>
                Generate a Report
              </Title>
              <Text type="secondary">
                Select a date range (optional) and click "Generate Report" to
                view and export data.
              </Text>
            </div>
          </Card>
        )}
      </Spin>
    </div>
  );
}
