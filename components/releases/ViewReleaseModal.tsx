import { Modal, Descriptions, Button, Typography } from "antd";
import { BudgetRelease } from "@/types";
import { formatCurrency, DEFAULT_CURRENCY, CurrencyCode } from "@/lib/currency";

interface ViewReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: BudgetRelease | null;
  currency?: CurrencyCode;
}

export default function ViewReleaseModal({
  isOpen,
  onClose,
  release,
  currency = DEFAULT_CURRENCY,
}: ViewReleaseModalProps) {
  if (!release) return null;

  return (
    <Modal
      title="Release Details"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={500}
      destroyOnHidden
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Date">
          {new Date(release.date).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Amount">
          <Typography.Text strong>
            {formatCurrency(release.amount, currency)}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Note">
          {release.note || "No note provided"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
