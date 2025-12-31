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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-20 -left-20 w-72 h-72 rounded-full opacity-30 blur-3xl animate-float"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        />
        <div
          className="absolute bottom-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl animate-float"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        className="fixed top-6 right-6 btn btn-icon btn-ghost z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" style={{ color: "var(--warning)" }} />
        ) : (
          <Moon className="w-5 h-5" style={{ color: "var(--primary)" }} />
        )}
      </motion.button>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <motion.div
              className="stat-icon-primary mx-auto mb-4"
              style={{ width: "72px", height: "72px" }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <HardHat className="w-9 h-9 text-white" />
            </motion.div>
          </Link>
          <h1
            className="text-3xl font-black"
            style={{ color: "var(--foreground)" }}
          >
            Welcome <span className="text-gradient">back</span>
          </h1>
          <p className="mt-2" style={{ color: "var(--foreground-muted)" }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <motion.div
          className="card card-gradient p-6 sm:p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{
                  backgroundColor: "var(--error-bg)",
                  color: "var(--error)",
                  border: "1px solid var(--error)",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
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
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: "3rem" }}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
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
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: "3rem" }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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

          <div className="mt-8 text-center">
            <p style={{ color: "var(--foreground-muted)" }} className="text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold transition-colors"
                style={{ color: "var(--primary)" }}
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
