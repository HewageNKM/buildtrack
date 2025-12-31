"use client";

import { Loader2, HardHat } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 40,
  };

  return (
    <Loader2
      className={`animate-spin ${className}`}
      style={{ width: sizes[size], height: sizes[size], color: "currentColor" }}
    />
  );
}

export function PageLoader() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
          }}
        />
      </div>

      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="flex items-center justify-center rounded-3xl"
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            boxShadow: "0 16px 40px rgba(139, 92, 246, 0.4)",
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <HardHat className="w-10 h-10 text-white" />
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#8b5cf6",
                }}
                animate={{
                  y: [-4, 4, -4],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
          <p style={{ fontSize: "14px", color: "var(--foreground-muted)" }}>
            Loading...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
