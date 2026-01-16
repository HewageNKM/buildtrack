"use client";

import { BudgetRelease } from "@/types";
import { formatCurrency, DEFAULT_CURRENCY, CurrencyCode } from "@/lib/currency";
import { Table, Button, Empty, Space, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  RiseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface ReleaseListProps {
  releases: BudgetRelease[];
  currency?: CurrencyCode;
  onDelete: (id: string) => void;
  onEdit: (release: BudgetRelease) => void;
  onView: (release: BudgetRelease) => void;
  isOwner: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalReleases: number;
}

export default function ReleaseList({
  releases,
  currency = DEFAULT_CURRENCY,
  onDelete,
  onEdit,
  onView,
  isOwner,
  currentPage,
  totalPages,
  onPageChange,
  totalReleases,
}: ReleaseListProps) {
  const columns: ColumnsType<BudgetRelease> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note: string) => note || "—",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount: number) => (
        <span style={{ fontWeight: 600 }}>
          {formatCurrency(amount, currency)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
          {isOwner && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
              <Popconfirm
                title="Delete Release"
                description="Are you sure you want to delete this release?"
                onConfirm={() => onDelete(record.id)}
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (releases.length === 0 && currentPage === 0) {
    return (
      <Empty
        image={<RiseOutlined style={{ fontSize: 48, color: "#8b5cf6" }} />}
        description={
          <span style={{ color: "var(--foreground-muted)" }}>
            No funds have been released for this project yet.
          </span>
        }
      />
    );
  }

  return (
    <Table
      scroll={{ x: 600 }}
      columns={columns}
      dataSource={releases}
      rowKey="id"
      pagination={{
        current: currentPage + 1,
        total: totalReleases,
        pageSize: 10,
        onChange: (page) => onPageChange(page - 1),
        showSizeChanger: false,
        showTotal: (total) => `Total ${total} releases`,
      }}
      size="middle"
    />
  );
}
