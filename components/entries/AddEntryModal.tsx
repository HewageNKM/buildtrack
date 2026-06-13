"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Input,
  Upload,
  Button,
  Card,
  Space,
  Spin,
  Divider,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { BudgetEntry, ProjectCategory, Vendor } from "@/types";
import { api } from "@/lib/api";
// import toast from "react-hot-toast"; // Removed
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onEntryAdded: () => void;
  initialData?: BudgetEntry;
}

interface FormItem {
  id: string;
  category: string;
  subCategory?: string;
  description: string;
  qty?: number;
  amount: number;
}

export default function AddEntryModal({
  isOpen,
  onClose,
  projectId,
  onEntryAdded,
  initialData,
}: AddEntryModalProps) {
  const [form] = Form.useForm();
  const [items, setItems] = useState<FormItem[]>([]);
  const [invoice, setInvoice] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchCategories();
      fetchVendors();
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Convert existing entry to items format
        if (initialData.items && initialData.items.length > 0) {
          setItems(
            initialData.items.map((item) => ({
              id: item.id,
              category: item.category || (initialData as any).category || "",
              subCategory: item.subCategory || "",
              description: item.description,
              qty: item.qty ?? 1,
              amount: item.amount,
            })),
          );
        } else {
          setItems([
            {
              id: "1",
              category: (initialData as any).category || "",
              subCategory: (initialData as any).subCategory || "",
              description: (initialData as any).description || "",
              qty: (initialData as any).qty ?? 1,
              amount: (initialData as any).amount || 0,
            },
          ]);
        }
        form.setFieldsValue({
          date: dayjs(initialData.date),
          note: "",
        });
      } else {
        // New entry - start with one empty item
        setItems([
          {
            id: Date.now().toString(),
            category: "",
            subCategory: "",
            description: "",
            qty: 1,
            amount: 0,
          },
        ]);
        form.setFieldsValue({
          date: dayjs(),
        });
      }
      setInvoice(null);
    }
  }, [isOpen, initialData, form]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await api.categories.list(projectId);
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      message.error("Failed to load project categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const data = await api.vendors.list(projectId);
      setVendors(data);
    } catch {
      // Vendors are optional, silently fail
    }
  };

  const handleScanReceipt = async (file: File) => {
    setScanning(true);
    message.loading({ content: "Scanning receipt with AI...", key: "scanReceipt" });
    try {
      const categoryNames = mainCategories.map((c) => c.name);
      const scannedData = await api.entries.scan(file, categoryNames);

      if (scannedData) {
        // 1. Set Date
        if (scannedData.date) {
          form.setFieldsValue({ date: dayjs(scannedData.date) });
        }

        // 2. Try to match Vendor
        if (scannedData.vendor) {
          const matchedVendor = vendors.find(
            (v) =>
              v.name.toLowerCase().includes(scannedData.vendor!.toLowerCase()) ||
              scannedData.vendor!.toLowerCase().includes(v.name.toLowerCase())
          );
          if (matchedVendor) {
            form.setFieldsValue({ vendorId: matchedVendor.id });
          }
        }

        // 3. Set Line Items
        if (scannedData.items && scannedData.items.length > 0) {
          const newItems = scannedData.items.map((item, idx) => ({
            id: (Date.now() + idx).toString(),
            category: item.category || "",
            subCategory: "",
            description: item.description || "Parsed Item",
            qty: item.qty || 1,
            amount: item.amount || 0,
          }));
          setItems(newItems);
        }

        message.success({
          content: "Receipt scanned successfully!",
          key: "scanReceipt",
          duration: 3,
        });
      }
    } catch (err) {
      console.error("Scanning failed:", err);
      message.error({
        content: "Failed to scan receipt. Please enter details manually.",
        key: "scanReceipt",
        duration: 3,
      });
    } finally {
      setScanning(false);
    }
  };

  const mainCategories = categories.filter((c) => c.type === "category");
  const subCategories = categories.filter((c) => c.type === "subcategory");

  const getSubcategories = (categoryName: string) => {
    const parent = mainCategories.find((c) => c.name === categoryName);
    if (!parent) return [];
    // Check if this category supports subcategories
    if (!parent.hasSubCategories) return [];
    return subCategories.filter(
      (s) => s.parentId === parent.id || s.parentId === parent.name,
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        category: "",
        subCategory: "",
        description: "",
        amount: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof FormItem,
    value: string | number,
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          if (field === "category") {
            return { ...item, category: value as string, subCategory: "" };
          }
          return { ...item, [field]: value };
        }
        return item;
      }),
    );
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.amount || 0) * (item.qty ?? 1),
    0,
  );

  const handleSubmit = async (formValues: {
    date: dayjs.Dayjs;
    note?: string;
    vendorId?: string;
  }) => {
    // Validate items
    const invalidItem = items.find(
      (item) =>
        !item.category ||
        !item.description.trim() ||
        item.amount <= 0 ||
        !item.qty ||
        item.qty <= 0,
    );
    if (invalidItem) {
      message.error(
        "All items must have category, description, valid quantity, and amount",
      );
      return;
    }

    if (totalAmount <= 0) {
      message.error("Total amount must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      const data = {
        // category: firstItem.category as BudgetCategory, // Removed
        // subCategory: firstItem.subCategory || undefined, // Removed
        // description: items.map((i) => i.description).join(", "), // Removed
        amount: totalAmount,
        date: formValues.date.format("YYYY-MM-DD"),
        invoice: invoice || undefined,
        note: initialData ? formValues.note : undefined,
        items: items.map((item) => ({
          id: item.id,
          category: item.category,
          subCategory: item.subCategory,
          description: item.description,
          qty: item.qty,
          amount: item.amount,
        })),
        vendorId: formValues.vendorId || undefined,
      };

      if (initialData) {
        await api.entries.update(projectId, initialData.id, data);
        message.success("Entry updated successfully");
      } else {
        await api.entries.create(projectId, data);
        message.success("Expense added successfully");
      }

      onEntryAdded();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving entry:", error);
      const err = error as { response?: { data?: { error?: string } } };
      message.error(err.response?.data?.error || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? "Edit Expense" : "Add Expense"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
      style={{ maxWidth: "100%", top: 20 }}
      destroyOnHidden
    >
      <Spin spinning={loadingCategories || scanning} tip={scanning ? "AI is scanning your receipt..." : undefined}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {/* Line Items */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text strong>
                <DollarOutlined style={{ marginRight: 8 }} />
                Line Items
              </Text>
              <Text strong style={{ color: "#8b5cf6" }}>
                Total: LKR {totalAmount.toLocaleString()}
              </Text>
            </div>

            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {items.map((item) => {
                const itemSubs = getSubcategories(item.category);
                return (
                  <Card
                    key={item.id}
                    size="small"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Space wrap style={{ width: "100%" }}>
                        <Select
                          placeholder="Category"
                          value={item.category || undefined}
                          onChange={(value) =>
                            updateItem(item.id, "category", value)
                          }
                          style={{ width: 180 }}
                          showSearch
                          optionFilterProp="label"
                          options={mainCategories.map((cat) => ({
                            value: cat.name,
                            label: cat.name,
                          }))}
                        />
                        {itemSubs.length > 0 && (
                          <Select
                            placeholder="Sub-category"
                            value={item.subCategory || undefined}
                            onChange={(value) =>
                              updateItem(item.id, "subCategory", value)
                            }
                            style={{ width: 180 }}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={itemSubs.map((sub) => ({
                              value: sub.name,
                              label: sub.name,
                            }))}
                          />
                        )}
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeItem(item.id)}
                          disabled={items.length <= 1}
                        />
                      </Space>
                      <Space style={{ width: "100%" }} wrap align="start">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          style={{ flex: 1, minWidth: "100%" }}
                        />
                        <InputNumber
                          placeholder="Qty (Optional)"
                          value={item.qty || undefined}
                          onChange={(value) =>
                            updateItem(item.id, "qty", value || 0)
                          }
                          min={0}
                          style={{ width: 120 }}
                        />
                        <InputNumber
                          placeholder="Unit Price"
                          value={item.amount || undefined}
                          onChange={(value) =>
                            updateItem(item.id, "amount", value || 0)
                          }
                          min={0}
                          step={0.01}
                          style={{ flex: 1, minWidth: 120 }}
                          prefix="LKR"
                        />
                      </Space>
                    </Space>
                  </Card>
                );
              })}

              <Button
                type="dashed"
                onClick={addItem}
                icon={<PlusOutlined />}
                block
              >
                Add Line Item
              </Button>
            </Space>
          </div>

          <Divider />

          {/* Vendor (optional) */}
          {vendors.length > 0 && (
            <Form.Item name="vendorId" label="Vendor (Optional)">
              <Select
                placeholder="Select vendor"
                allowClear
                showSearch
                optionFilterProp="children"
                size="large"
                options={vendors.map((v) => ({
                  value: v.id,
                  label: v.name,
                }))}
              />
            </Form.Item>
          )}

          {/* Date */}
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker style={{ width: "100%" }} size="large" />
          </Form.Item>

          {/* Invoice Upload */}
          <Form.Item label="Invoice/Receipt (Optional)">
            <Space align="center" style={{ width: "100%" }} wrap>
              <Upload
                beforeUpload={(file) => {
                  const isValid =
                    file.type.startsWith("image/") ||
                    file.type === "application/pdf";
                  if (!isValid) {
                    message.error("Only images and PDF files are allowed");
                    return false;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    message.error("File size must be less than 5MB");
                    return false;
                  }
                  setInvoice(file);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setInvoice(null)}
                fileList={
                  invoice
                    ? [{ uid: "-1", name: invoice.name, status: "done" }]
                    : []
                }
              >
                <Button icon={<UploadOutlined />}>Upload Invoice</Button>
              </Upload>
              {invoice && (
                <Button
                  type="primary"
                  onClick={() => handleScanReceipt(invoice)}
                  loading={scanning}
                  style={{
                    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                    borderColor: "transparent",
                  }}
                >
                  Scan Receipt with AI
                </Button>
              )}
            </Space>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Max 5MB. Supports images and PDF. Upload a receipt and click "Scan Receipt with AI" to auto-fill.
              </Text>
            </div>
          </Form.Item>

          {/* Note for versioning (only when editing) */}
          {initialData && (
            <Form.Item name="note" label="Reason for Edit">
              <TextArea
                rows={2}
                placeholder="Why are you making this change?"
              />
            </Form.Item>
          )}

          {/* Submit */}
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              {initialData ? "Save Changes" : "Add Expense"}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
