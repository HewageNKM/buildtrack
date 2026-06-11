"use client";

import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmModalProps) {
  // We use the imperative Modal.confirm API usually, but since this is a declarative component in the current codebase,
  // we will implement it using the Modal component controlled by props.
  // Ideally, this component should be replaced by Modal.confirm() calls in the parent components.

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleFilled
            style={{
              color: isDestructive ? "#ff4d4f" : "#faad14",
              marginRight: 8,
            }}
          />
          {title}
        </span>
      }
      open={isOpen}
      onOk={() => {
        onConfirm();
        // The parent is expected to close the modal after confirmation logic usually,
        // but if onConfirm is synchronous, we might need to handle closure.
        // However, looking at usage, typically custom implementations handle close.
        // But for antd Modal, hitting ok doesn't auto close if controlled.
        // We'll leave it to parent to toggle isOpen if they passed it, or we rely on onClose callback.
      }}
      onCancel={onClose}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{ danger: isDestructive }}
    >
      <p>{message}</p>
    </Modal>
  );
}
