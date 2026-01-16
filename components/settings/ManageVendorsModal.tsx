"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  Space,
  Typography,
  Popconfirm,
  Card,
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Vendor } from "@/types";
import { api } from "@/lib/api";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;
const { TextArea } = Input;

interface ManageVendorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export default function ManageVendorsModal({
  isOpen,
  onClose,
  projectId,
}: ManageVendorsModalProps) {
  const [form] = Form.useForm();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchVendors();
    }
  }, [isOpen, projectId]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await api.vendors.list(projectId);
      setVendors(data);
    } catch {
      message.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Partial<Vendor>) => {
    setSubmitting(true);
    try {
      if (editingVendor) {
        await api.vendors.update(projectId, editingVendor.id, values);
        message.success("Vendor updated");
      } else {
        await api.vendors.create(projectId, {
          ...values,
          isActive: true,
        } as Omit<Vendor, "id" | "projectId" | "createdAt" | "updatedAt">);
        message.success("Vendor added");
      }
      form.resetFields();
      setShowForm(false);
      setEditingVendor(null);
      fetchVendors();
    } catch {
      message.error("Failed to save vendor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    form.setFieldsValue(vendor);
    setShowForm(true);
  };

  const handleDelete = async (vendorId: string) => {
    try {
      await api.vendors.delete(projectId, vendorId);
      message.success("Vendor deleted");
      fetchVendors();
    } catch {
      message.error("Failed to delete vendor");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setShowForm(false);
    setEditingVendor(null);
  };

  const columns: ColumnsType<Vendor> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.category && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.category}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.contactName && <Text>{record.contactName}</Text>}
          {record.phone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <PhoneOutlined /> {record.phone}
            </Text>
          )}
          {record.email && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined /> {record.email}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentTerms",
      key: "paymentTerms",
      render: (text) => text || "-",
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
            title="Delete this vendor?"
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
          <ShopOutlined />
          <span>Manage Vendors</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Track suppliers and contractors for this project
      </Text>

      {!showForm && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm(true)}
          style={{ marginBottom: 16 }}
        >
          Add Vendor
        </Button>
      )}

      {showForm && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Vendor Name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input placeholder="e.g., ABC Cement Suppliers" />
            </Form.Item>

            <Form.Item name="category" label="Category">
              <Input placeholder="e.g., Materials, Labor, Equipment" />
            </Form.Item>

            <Space style={{ width: "100%" }} wrap>
              <Form.Item
                name="contactName"
                label="Contact Person"
                style={{ flex: 1 }}
              >
                <Input placeholder="Contact name" />
              </Form.Item>
              <Form.Item name="phone" label="Phone" style={{ flex: 1 }}>
                <Input placeholder="Phone number" />
              </Form.Item>
              <Form.Item name="email" label="Email" style={{ flex: 1 }}>
                <Input placeholder="Email address" />
              </Form.Item>
            </Space>

            <Form.Item name="address" label="Address">
              <Input placeholder="Business address" />
            </Form.Item>

            <Form.Item name="paymentTerms" label="Payment Terms">
              <Input placeholder="e.g., Net 30, COD, 50% upfront" />
            </Form.Item>

            <Form.Item name="notes" label="Notes">
              <TextArea rows={2} placeholder="Additional notes..." />
            </Form.Item>

            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingVendor ? "Update" : "Add"} Vendor
              </Button>
            </Space>
          </Form>
        </Card>
      )}

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={vendors}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: "No vendors added yet" }}
        />
      </Spin>
    </Modal>
  );
}
