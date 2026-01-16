import { Modal, Descriptions, Button, Tag, Typography } from "antd";
import { BudgetEntry, BUDGET_CATEGORIES } from "@/types";
import { formatCurrency, DEFAULT_CURRENCY, CurrencyCode } from "@/lib/currency";

interface ViewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: BudgetEntry | null;
  currency?: CurrencyCode;
}

export default function ViewEntryModal({
  isOpen,
  onClose,
  entry,
  currency = DEFAULT_CURRENCY,
}: ViewEntryModalProps) {
  if (!entry) return null;

  // Fallback logic for display when global fields are gone
  const items = entry.items || [];
  const primaryItem = items[0] || entry; // fallback to entry if items empty (shouldn't happen)
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
      width={600}
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
          <Tag>{categoryLabel}</Tag>
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
                    {BUDGET_CATEGORIES.find((c) => c.value === item.category)
                      ?.label || item.category}
                  </Tag>
                  {item.subCategory && (
                    <Typography.Text type="secondary">
                      • {item.subCategory}
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
                  new Date(a.timestamp).getTime()
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
    </Modal>
  );
}
