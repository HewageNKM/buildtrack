"use client";

import { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, FileText } from "lucide-react";

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="font-medium truncate">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            {fileType === "image" && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="btn btn-ghost btn-sm p-1"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-foreground-muted min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="btn btn-ghost btn-sm p-1"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={handleDownload}
              className="btn btn-ghost btn-sm p-1"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="modal-close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-background-secondary rounded-lg min-h-[400px]">
          {fileType === "image" ? (
            <div className="flex items-center justify-center p-4 min-h-full">
              <img
                src={fileUrl}
                alt={fileName}
                style={{ transform: `scale(${zoom})` }}
                className="max-w-full h-auto transition-transform duration-200 rounded-lg"
              />
            </div>
          ) : (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=0`}
              title={fileName}
              className="w-full h-full min-h-[500px] rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}
