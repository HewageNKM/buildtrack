"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Table,
  Space,
  Typography,
  Popconfirm,
  Card,
  Progress,
  message,
  Spin,
  Tag,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { ProjectPhase } from "@/types";
import { api } from "@/lib/api";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

interface ManagePhasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currency?: string;
}

export default function ManagePhasesModal({
  isOpen,
  onClose,
  projectId,
  currency = "LKR",
}: ManagePhasesModalProps) {
  const [form] = Form.useForm();
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchPhases();
    }
  }, [isOpen, projectId]);

  const fetchPhases = async () => {
    setLoading(true);
    try {
      const data = await api.phases.list(projectId);
      setPhases(data);
    } catch {
      message.error("Failed to load phases");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    allocatedBudget: number;
    status: ProjectPhase["status"];
    startDate?: dayjs.Dayjs;
    endDate?: dayjs.Dayjs;
    description?: string;
  }) => {
    setSubmitting(true);
    try {
      const data = {
        name: values.name,
        allocatedBudget: values.allocatedBudget,
        status: values.status,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        description: values.description,
      };

      if (editingPhase) {
        await api.phases.update(projectId, editingPhase.id, data);
        message.success("Phase updated");
      } else {
        await api.phases.create(
          projectId,
          data as Omit<
            ProjectPhase,
            "id" | "projectId" | "order" | "createdAt" | "updatedAt"
          >
        );
        message.success("Phase added");
      }
      form.resetFields();
      setShowForm(false);
      setEditingPhase(null);
      fetchPhases();
    } catch {
      message.error("Failed to save phase");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (phase: ProjectPhase) => {
    setEditingPhase(phase);
    form.setFieldsValue({
      ...phase,
      startDate: phase.startDate ? dayjs(phase.startDate) : undefined,
      endDate: phase.endDate ? dayjs(phase.endDate) : undefined,
    });
    setShowForm(true);
  };

  const handleDelete = async (phaseId: string) => {
    try {
      await api.phases.delete(projectId, phaseId);
      message.success("Phase deleted");
      fetchPhases();
    } catch {
      message.error("Failed to delete phase");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setShowForm(false);
    setEditingPhase(null);
  };

  const totalAllocated = phases.reduce((sum, p) => sum + p.allocatedBudget, 0);

  const statusColors = {
    planned: "default",
    "in-progress": "processing",
    completed: "success",
  } as const;

  const columns: ColumnsType<ProjectPhase> = [
    {
      title: "#",
      dataIndex: "order",
      key: "order",
      width: 50,
    },
    {
      title: "Phase",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Budget",
      dataIndex: "allocatedBudget",
      key: "allocatedBudget",
      render: (val) => `${currency} ${val.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status as keyof typeof statusColors]}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Dates",
      key: "dates",
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.startDate || "?"} → {record.endDate || "?"}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this phase?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FlagOutlined />
          <span>Manage Project Phases</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnHidden
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Define project milestones and allocate budget per phase
      </Text>

      {/* Summary */}
      <div style={{ marginBottom: 16 }}>
        <Text>Total Allocated: </Text>
        <Text strong>
          {currency} {totalAllocated.toLocaleString()}
        </Text>
      </div>

      {!showForm && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(true)}
          style={{ marginBottom: 16 }}
        >
          Add Phase
        </Button>
      )}

      {showForm && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Phase Name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input placeholder="e.g., Foundation, Framing, Finishing" />
            </Form.Item>

            <Space style={{ width: "100%" }} wrap>
              <Form.Item
                name="allocatedBudget"
                label="Allocated Budget"
                rules={[{ required: true, message: "Budget is required" }]}
                style={{ flex: 1, minWidth: 150 }}
              >
                <InputNumber
                  prefix={currency}
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                initialValue="planned"
                style={{ flex: 1, minWidth: 150 }}
              >
                <Select>
                  <Select.Option value="planned">Planned</Select.Option>
                  <Select.Option value="in-progress">In Progress</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                </Select>
              </Form.Item>
            </Space>

            <Space style={{ width: "100%" }} wrap>
              <Form.Item
                name="startDate"
                label="Start Date"
                style={{ flex: 1 }}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="endDate" label="End Date" style={{ flex: 1 }}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Space>

            <Form.Item name="description" label="Description">
              <TextArea rows={2} placeholder="Phase details..." />
            </Form.Item>

            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingPhase ? "Update" : "Add"} Phase
              </Button>
            </Space>
          </Form>
        </Card>
      )}

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={phases}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: "No phases defined yet" }}
        />
      </Spin>
    </Modal>
  );
}
