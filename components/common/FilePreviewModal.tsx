"use client";

import { Modal, Image, Button, Space } from "antd";
import {
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { useState } from "react";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: "image" | "pdf";
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType,
}: FilePreviewModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      title={fileName}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      styles={{ body: { padding: 0, overflow: "hidden", minHeight: 400 } }}
      centered
      destroyOnHidden
    >
      <div
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "#f0f2f5",
        }}
      >
        <div
          style={{
            padding: "8px 16px",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            type="text"
          >
            Download
          </Button>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          {fileType === "image" ? (
            <Image
              src={fileUrl}
              alt={fileName}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=0`}
              title={fileName}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: 8,
              }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
