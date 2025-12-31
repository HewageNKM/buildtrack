"use client";

import { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const buttonStyle = {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "var(--background-secondary)",
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          padding: "24px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full rounded-3xl flex flex-col"
          style={{
            maxWidth: "900px",
            maxHeight: "90vh",
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between shrink-0"
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{
                  width: "40px",
                  height: "40px",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span
                className="truncate"
                style={{ fontWeight: 600, fontSize: "15px" }}
              >
                {fileName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {fileType === "image" && (
                <>
                  <button
                    onClick={handleZoomOut}
                    style={buttonStyle}
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span
                    className="text-center"
                    style={{
                      minWidth: "52px",
                      fontSize: "13px",
                      color: "var(--foreground-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    style={buttonStyle}
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-xl transition-colors"
                style={{
                  padding: "8px 14px",
                  backgroundColor: "var(--background-secondary)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
                title="Download"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-xl transition-colors"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "var(--background-secondary)",
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-auto"
            style={{
              backgroundColor: "var(--background-secondary)",
              minHeight: "400px",
            }}
          >
            {fileType === "image" ? (
              <div
                className="flex items-center justify-center min-h-full"
                style={{ padding: "24px" }}
              >
                <img
                  src={fileUrl}
                  alt={fileName}
                  style={{
                    transform: `scale(${zoom})`,
                    transition: "transform 0.2s ease",
                  }}
                  className="max-w-full h-auto rounded-xl"
                />
              </div>
            ) : (
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                title={fileName}
                className="w-full h-full rounded-xl"
                style={{ minHeight: "500px" }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
