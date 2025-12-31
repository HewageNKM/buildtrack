"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import {
  HardHat,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/projects");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later");
      } else {
        setError(error.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      router.push("/projects");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/popup-closed-by-user") {
        // User closed the popup, no error needed
      } else if (error.code === "auth/cancelled-popup-request") {
        // Popup was cancelled, no error needed
      } else {
        setError(error.message || "Failed to sign in with Google");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full opacity-25 blur-[100px]"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
          }}
        />
        <div
          className="absolute bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
          style={{
            background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
          }}
        />
      </div>

      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        className="fixed top-6 right-6 flex items-center justify-center rounded-xl z-50"
        style={{
          width: "48px",
          height: "48px",
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" style={{ color: "#fbbf24" }} />
        ) : (
          <Moon className="w-5 h-5" style={{ color: "#8b5cf6" }} />
        )}
      </motion.button>

      <motion.div
        style={{ width: "100%", maxWidth: "420px" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Link href="/" className="inline-block">
            <motion.div
              className="flex items-center justify-center rounded-2xl mx-auto"
              style={{
                width: "80px",
                height: "80px",
                marginBottom: "20px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                boxShadow: "0 12px 35px rgba(139, 92, 246, 0.4)",
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <HardHat className="w-10 h-10 text-white" />
            </motion.div>
          </Link>
          <h1
            style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px" }}
          >
            Welcome <span className="text-gradient">back</span>
          </h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "16px" }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          className="rounded-3xl"
          style={{
            padding: "40px 32px",
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Google Sign In Button */}
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl transition-all"
            style={{
              padding: "14px 24px",
              backgroundColor: "var(--background-secondary)",
              border: "2px solid var(--border)",
              fontSize: "15px",
              fontWeight: 600,
              marginBottom: "24px",
              opacity: googleLoading ? 0.7 : 1,
            }}
            whileHover={{
              scale: googleLoading ? 1 : 1.02,
              borderColor: "var(--primary)",
            }}
            whileTap={{ scale: googleLoading ? 1 : 0.98 }}
          >
            {googleLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div
            className="flex items-center gap-4"
            style={{ marginBottom: "24px" }}
          >
            <div
              className="flex-1"
              style={{ height: "1px", backgroundColor: "var(--border)" }}
            />
            <span
              style={{
                fontSize: "13px",
                color: "var(--foreground-muted)",
                fontWeight: 500,
              }}
            >
              or
            </span>
            <div
              className="flex-1"
              style={{ height: "1px", backgroundColor: "var(--border)" }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <motion.div
                className="flex items-center gap-3 rounded-xl"
                style={{
                  padding: "16px",
                  marginBottom: "24px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  fontSize: "14px",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail
                    className="w-5 h-5"
                    style={{ color: "var(--foreground-muted)" }}
                  />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl transition-all"
                  style={{
                    padding: "16px 16px 16px 48px",
                    backgroundColor: "var(--background-secondary)",
                    border: "2px solid transparent",
                    fontSize: "15px",
                    color: "var(--foreground)",
                  }}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock
                    className="w-5 h-5"
                    style={{ color: "var(--foreground-muted)" }}
                  />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl transition-all"
                  style={{
                    padding: "16px 16px 16px 48px",
                    backgroundColor: "var(--background-secondary)",
                    border: "2px solid transparent",
                    fontSize: "15px",
                    color: "var(--foreground)",
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl text-white transition-all"
              style={{
                padding: "16px 24px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                fontSize: "16px",
                fontWeight: 700,
                boxShadow: "0 8px 25px rgba(139, 92, 246, 0.4)",
                opacity: loading ? 0.7 : 1,
              }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <p style={{ color: "var(--foreground-muted)", fontSize: "14px" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                style={{ color: "#8b5cf6", fontWeight: 600 }}
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
