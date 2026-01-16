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

  const categoryLabel =
    BUDGET_CATEGORIES.find((c) => c.value === entry.category)?.label ||
    entry.category;

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
          {entry.description}
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
    </Modal>
  );
}
