"use client";

import { useEffect } from "react";
import { Modal, Form, InputNumber, DatePicker, Input, Button } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { BudgetRelease } from "@/types";
import dayjs from "dayjs";

interface AddReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onReleaseAdded: () => void;
  remainingEstimation: number;
  initialData?: BudgetRelease;
}

export default function AddReleaseModal({
  isOpen,
  onClose,
  projectId,
  onReleaseAdded,
  remainingEstimation,
  initialData,
}: AddReleaseModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldsValue({
          amount: initialData.amount,
          date: dayjs(initialData.date),
          note: initialData.note || "",
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          date: dayjs(),
        });
      }
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = async (values: {
    amount: number;
    date: dayjs.Dayjs;
    note?: string;
  }) => {
    try {
      const releaseAmount = values.amount;

      if (releaseAmount > remainingEstimation) {
        toast.error(
          "Release amount cannot exceed the project's remaining estimated budget."
        );
        return;
      }

      const data = {
        amount: releaseAmount,
        date: values.date.format("YYYY-MM-DD"),
        note: values.note || "",
      };

      if (initialData) {
        await api.releases.update(projectId, initialData.id, data);
        toast.success("Release updated successfully");
      } else {
        await api.releases.create(projectId, data);
        toast.success("Funds released successfully");
      }

      onReleaseAdded();
      onClose();
    } catch (error: unknown) {
      console.error("Error creating release:", error);
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to release funds");
    }
  };

  return (
    <Modal
      title={initialData ? "Edit Release" : "Release Funds"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <p style={{ marginBottom: 24, color: "var(--foreground-muted)" }}>
        Add funds to the working capital
      </p>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: "Please enter an amount" },
            {
              type: "number",
              min: 0.01,
              message: "Amount must be greater than 0",
            },
          ]}
          extra={`Allowed: ${remainingEstimation.toLocaleString()} ${DEFAULT_CURRENCY}`}
        >
          <InputNumber
            prefix={DEFAULT_CURRENCY}
            style={{ width: "100%" }}
            placeholder="0.00"
            min={0}
            step={0.01}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker style={{ width: "100%" }} size="large" />
        </Form.Item>

        <Form.Item name="note" label="Note (Optional)">
          <Input.TextArea rows={3} placeholder="e.g., Phase 1 Mobilization" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<DollarOutlined />}
            size="large"
            block
          >
            {initialData ? "Save Changes" : "Release Funds"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
