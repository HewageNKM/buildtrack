import { Modal, Descriptions, Button, Tag, Typography } from "antd";
import { BudgetEntry } from "@/types";
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

interface ViewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: BudgetEntry | null;
  currency?: string;
}

export default function ViewEntryModal({
  isOpen,
  onClose,
  entry,
  currency = DEFAULT_CURRENCY,
}: ViewEntryModalProps) {
  if (!entry) return null;

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
          <Tag>{entry.category?.name || "Uncategorized"}</Tag>
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
