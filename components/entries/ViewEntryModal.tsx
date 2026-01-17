"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Descriptions,
  Button,
  Tag,
  Typography,
  Input,
  List,
  Avatar,
  Space,
  Spin,
  Popconfirm,
  message,
  Divider,
} from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  CommentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { BudgetEntry, EntryComment, BUDGET_CATEGORIES } from "@/types";
import { formatCurrency, DEFAULT_CURRENCY, CurrencyCode } from "@/lib/currency";
import { api } from "@/lib/api";

interface ViewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: BudgetEntry | null;
  currency?: CurrencyCode;
  projectId?: string;
  currentUserId?: string;
}

export default function ViewEntryModal({
  isOpen,
  onClose,
  entry,
  currency = DEFAULT_CURRENCY,
  projectId,
  currentUserId,
}: ViewEntryModalProps) {
  const [comments, setComments] = useState<EntryComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && entry && projectId) {
      fetchComments();
    } else {
      setComments([]);
      setNewComment("");
    }
  }, [isOpen, entry?.id, projectId]);

  const fetchComments = async () => {
    if (!entry || !projectId) return;
    setLoadingComments(true);
    try {
      const data = await api.comments.list(projectId, entry.id);
      setComments(data);
    } catch {
      // Silently fail - comments are optional
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!entry || !projectId || !newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await api.comments.create(
        projectId,
        entry.id,
        newComment.trim(),
      );
      setComments([comment, ...comments]);
      setNewComment("");
      message.success("Comment added");
    } catch {
      message.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!entry || !projectId) return;
    try {
      await api.comments.delete(projectId, entry.id, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      message.success("Comment deleted");
    } catch {
      message.error("Failed to delete comment");
    }
  };

  if (!entry) return null;

  const items = entry.items || [];
  const primaryItem = items[0] || entry;
  const isMixed = items.length > 1;

  const categoryLabel = isMixed
    ? `Multiple Items (${items.length})`
    : BUDGET_CATEGORIES.find((c) => c.value === primaryItem.category)?.label ||
      primaryItem.category ||
      "Uncategorized";

  const descriptionLabel = isMixed
    ? "See line items below"
    : primaryItem.description || "No description";

  return (
    <Modal
      title="Expense Details"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={650}
      destroyOnHidden
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Date">
          {new Date(entry.date).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {descriptionLabel}
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          <Tag>
            {categoryLabel
              ?.toString()
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ")}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Amount">
          <Typography.Text strong>
            {formatCurrency(entry.amount, currency)}
          </Typography.Text>
        </Descriptions.Item>
        {entry.invoiceUrl && (
          <Descriptions.Item label="Receipt">
            <a
              href={entry.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Receipt
            </a>
          </Descriptions.Item>
        )}
      </Descriptions>

      {entry.items && entry.items.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Typography.Title level={5}>Line Items</Typography.Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entry.items.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: 12,
                  background: "rgba(0,0,0,0.02)",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 4,
                  }}
                >
                  <Typography.Text strong>{item.description}</Typography.Text>
                  <Typography.Text strong>
                    {formatCurrency(item.amount, currency)}
                  </Typography.Text>
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                  <Tag style={{ marginRight: 0 }}>
                    {(
                      BUDGET_CATEGORIES.find((c) => c.value === item.category)
                        ?.label ||
                      item.category ||
                      ""
                    )
                      .split(" ")
                      .map(
                        (w) =>
                          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                      )
                      .join(" ")}
                  </Tag>
                  {item.subCategory && (
                    <Typography.Text type="secondary">
                      •{" "}
                      {item.subCategory
                        .split(" ")
                        .map(
                          (w) =>
                            w.charAt(0).toUpperCase() +
                            w.slice(1).toLowerCase(),
                        )
                        .join(" ")}
                    </Typography.Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.history && entry.history.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Typography.Title level={5}>Edit History</Typography.Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entry.history
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime(),
              )
              .map((version) => (
                <div
                  key={version.id}
                  style={{
                    padding: 12,
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.06)",
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Typography.Text type="secondary">
                      {new Date(version.timestamp).toLocaleString()}
                    </Typography.Text>
                  </div>
                  {version.note && (
                    <div style={{ marginBottom: 8 }}>
                      <Typography.Text strong>Reason:</Typography.Text>{" "}
                      {version.note}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Previous Amount:{" "}
                    {formatCurrency(version.snapshot.amount || 0, currency)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {projectId && (
        <>
          <Divider />
          <div>
            <Typography.Title level={5}>
              <CommentOutlined style={{ marginRight: 8 }} />
              Comments
            </Typography.Title>

            {/* Add Comment Input */}
            <Space.Compact style={{ width: "100%", marginBottom: 16 }}>
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onPressEnter={handleAddComment}
                disabled={submitting}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleAddComment}
                loading={submitting}
                disabled={!newComment.trim()}
              />
            </Space.Compact>

            {/* Comments List */}
            <Spin spinning={loadingComments}>
              {comments.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item
                      actions={
                        comment.userId === currentUserId
                          ? [
                              <Popconfirm
                                key="delete"
                                title="Delete this comment?"
                                onConfirm={() =>
                                  handleDeleteComment(comment.id)
                                }
                                okText="Delete"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                />
                              </Popconfirm>,
                            ]
                          : []
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} size="small" />}
                        title={
                          <Space>
                            <Typography.Text strong style={{ fontSize: 13 }}>
                              {comment.userName}
                            </Typography.Text>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 11 }}
                            >
                              {new Date(comment.createdAt).toLocaleString()}
                            </Typography.Text>
                          </Space>
                        }
                        description={comment.content}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  No comments yet. Be the first to comment!
                </Typography.Text>
              )}
            </Spin>
          </div>
        </>
      )}
    </Modal>
  );
}
