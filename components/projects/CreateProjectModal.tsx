"use client";

import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Alert,
  Row,
  Col,
} from "antd";
import { ProjectOutlined } from "@ant-design/icons";
import {
  CurrencyCode,
  CURRENCY_LIST,
  DEFAULT_CURRENCY,
  getCurrencySymbol,
} from "@/lib/currency";
import dayjs from "dayjs";

const { TextArea } = Input;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: {
    name: string;
    description: string;
    estimatedBudget: number;
    currency: CurrencyCode;
    startDate: string;
    endDate?: string;
  }) => Promise<void>;
  initialData?: {
    name: string;
    description: string;
    estimatedBudget: number;
    currency?: CurrencyCode;
    startDate: string;
    endDate?: string;
  };
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProjectModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          description: initialData.description,
          estimatedBudget: initialData.estimatedBudget,
          currency: initialData.currency || DEFAULT_CURRENCY,
          startDate: dayjs(initialData.startDate),
          endDate: initialData.endDate ? dayjs(initialData.endDate) : undefined,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          currency: DEFAULT_CURRENCY,
          startDate: dayjs(),
        });
      }
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = async (values: {
    name: string;
    description?: string;
    estimatedBudget: number;
    currency: CurrencyCode;
    startDate: dayjs.Dayjs;
    endDate?: dayjs.Dayjs;
  }) => {
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description?.trim() || "",
        estimatedBudget: values.estimatedBudget,
        currency: values.currency,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate
          ? values.endDate.format("YYYY-MM-DD")
          : undefined,
      });
      onClose();
    } catch {
      // Error handling in parent
    }
  };

  const currency = Form.useWatch("currency", form) || DEFAULT_CURRENCY;

  return (
    <Modal
      title={
        <span>
          <ProjectOutlined style={{ marginRight: 8 }} />
          {initialData ? "Edit Project" : "New Project"}
        </span>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      style={{ maxWidth: "100%", top: 20 }}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: "Project name is required" }]}
        >
          <Input placeholder="e.g., Downtown Office Complex" size="large" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={3}
            placeholder="Brief description of the project scope and goals..."
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="estimatedBudget"
              label="Estimated Budget"
              rules={[
                { required: true, message: "Budget is required" },
                {
                  type: "number",
                  min: 0.01,
                  message: "Must be greater than 0",
                },
              ]}
            >
              <InputNumber
                prefix={getCurrencySymbol(currency)}
                style={{ width: "100%" }}
                placeholder="0.00"
                min={0}
                step={0.01}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="currency"
              label="Currency"
              rules={[{ required: true }]}
            >
              <Select size="large">
                {CURRENCY_LIST.map((c) => (
                  <Select.Option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: "Start date is required" }]}
            >
              <DatePicker style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endDate" label="End Date (Optional)">
              <DatePicker style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Button block size="large" onClick={onClose}>
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" htmlType="submit" block size="large">
                {initialData ? "Save Changes" : "Create Project"}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
}
