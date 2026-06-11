"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Popconfirm,
  ColorPicker,
  Empty,
  Spin,
  Switch,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  FolderOutlined,
  TagOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { ProjectCategory } from "@/types";
import { api } from "@/lib/api";
import type { Color } from "antd/es/color-picker";

const { Text } = Typography;

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onCategoriesUpdated: () => void;
}

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  projectId,
  onCategoriesUpdated,
}: ManageCategoriesModalProps) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingType, setAddingType] = useState<
    "category" | "subcategory" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ProjectCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<string>("#3B82F6");
  const [editHasSubs, setEditHasSubs] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchCategories();
    }
  }, [isOpen, projectId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.categories.list(projectId);
      setCategories(data);
    } catch {
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const mainCategories = categories.filter((c) => c.type === "category");
  const subCategories = categories.filter((c) => c.type === "subcategory");

  const getSubsForParent = (parent: ProjectCategory) => {
    return subCategories.filter(
      (sub) => sub.parentId === parent.id || sub.parentId === parent.name
    );
  };

  const handleAdd = async (values: {
    name: string;
    color?: Color;
    parentId?: string;
  }) => {
    if (!addingType) return;

    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        type: addingType,
        color:
          addingType === "category" && values.color
            ? typeof values.color === "string"
              ? values.color
              : values.color.toHexString()
            : undefined,
        parentId: addingType === "subcategory" ? values.parentId : undefined,
        hasSubCategories: addingType === "category" ? false : undefined,
      };

      await api.categories.create(projectId, payload);
      message.success(
        `${addingType === "category" ? "Category" : "Subcategory"} added`
      );
      form.resetFields();
      setAddingType(null);
      fetchCategories();
      onCategoriesUpdated();
    } catch {
      message.error("Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await api.categories.delete(projectId, id);
      message.success(`"${name}" deleted`);
      fetchCategories();
      onCategoriesUpdated();
    } catch {
      message.error("Failed to delete category");
    }
  };

  const startEdit = (cat: ProjectCategory) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditColor(cat.color || "#3B82F6");
    setEditHasSubs(cat.hasSubCategories || false);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
    setEditColor("#3B82F6");
    setEditHasSubs(false);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    setSubmitting(true);
    try {
      await api.categories.update(projectId, editingCategory.id, {
        name: editName,
        color: editColor,
        hasSubCategories: editHasSubs,
      });
      message.success("Category updated");
      cancelEdit();
      fetchCategories();
      onCategoriesUpdated();
    } catch {
      message.error("Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <FolderOutlined />
          <span>Manage Categories</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
      style={{ maxWidth: "100%", top: 20 }}
      destroyOnHidden
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Customize categories for this project
      </Text>

      {/* Add Buttons */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<FolderOutlined />}
          onClick={() => {
            setAddingType("category");
            form.resetFields();
          }}
        >
          Add Main Category
        </Button>
        <Button
          icon={<TagOutlined />}
          onClick={() => {
            setAddingType("subcategory");
            form.resetFields();
            if (mainCategories.length > 0) {
              form.setFieldsValue({ parentId: mainCategories[0].name });
            }
          }}
          disabled={mainCategories.length === 0}
        >
          Add Subcategory
        </Button>
      </Space>

      {/* Add Form */}
      {addingType && (
        <Form
          form={form}
          layout="inline"
          onFinish={handleAdd}
          style={{
            marginBottom: 24,
            padding: 16,
            background: "rgba(255,255,255,0.02)",
            borderRadius: 8,
          }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Name required" }]}
            style={{ flex: 1 }}
          >
            <Input
              placeholder={`${
                addingType === "category" ? "Category" : "Subcategory"
              } name`}
            />
          </Form.Item>

          {addingType === "category" ? (
            <Form.Item name="color" initialValue="#3B82F6">
              <ColorPicker />
            </Form.Item>
          ) : (
            <Form.Item
              name="parentId"
              rules={[{ required: true, message: "Select parent" }]}
            >
              <Select style={{ width: 150 }} placeholder="Parent category">
                {mainCategories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.name}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button onClick={() => setAddingType(null)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}

      {/* Categories List */}
      <Spin spinning={loading}>
        {mainCategories.length === 0 ? (
          <Empty description="No categories yet" />
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {mainCategories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {/* Category Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  {editingCategory?.id === cat.id ? (
                    /* Inline Edit View */
                    <Space wrap>
                      <ColorPicker
                        value={editColor}
                        onChange={(color) => setEditColor(color.toHexString())}
                        size="small"
                      />
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ width: 150 }}
                        size="small"
                      />
                      <Space size={4}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Has Subs:
                        </Text>
                        <Switch
                          checked={editHasSubs}
                          onChange={setEditHasSubs}
                          size="small"
                        />
                      </Space>
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={handleUpdate}
                        loading={submitting}
                        size="small"
                        style={{ color: "#52c41a" }}
                      />
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={cancelEdit}
                        size="small"
                      />
                    </Space>
                  ) : (
                    /* Normal View */
                    <>
                      <Space>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: cat.color || "#666",
                          }}
                        />
                        <Text strong>{cat.name}</Text>
                        {cat.hasSubCategories && (
                          <Tag color="blue" style={{ fontSize: 10 }}>
                            Has Subs
                          </Tag>
                        )}
                      </Space>
                      <Space>
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          size="small"
                          onClick={() => startEdit(cat)}
                        />
                        <Popconfirm
                          title={`Delete "${cat.name}"?`}
                          description="This will also delete all subcategories"
                          onConfirm={() => handleDelete(cat.id, cat.name)}
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                          />
                        </Popconfirm>
                      </Space>
                    </>
                  )}
                </div>

                {/* Subcategories */}
                <div style={{ padding: "12px 16px" }}>
                  {getSubsForParent(cat).length > 0 ? (
                    <Space wrap>
                      {getSubsForParent(cat).map((sub) => (
                        <Tag
                          key={sub.id}
                          closable
                          onClose={(e) => {
                            e.preventDefault();
                            handleDelete(sub.id, sub.name);
                          }}
                        >
                          {sub.name}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary" italic style={{ fontSize: 12 }}>
                      No subcategories
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </Space>
        )}
      </Spin>
    </Modal>
  );
}
