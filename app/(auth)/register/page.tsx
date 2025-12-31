"use client";

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
  User,
  ArrowRight,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(email, password, displayName);
      router.push("/projects");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Unlimited projects",
    "Invoice uploads",
    "Visual analytics",
    "Secure & private",
  ];

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-1/4 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-10 w-48 h-48 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
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
          <Sun className="w-5 h-5 text-warning" />
        ) : (
          <Moon className="w-5 h-5 text-primary" />
        )}
      </motion.button>

      {/* Left Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <motion.div
          className="max-w-md"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="stat-icon-secondary p-4 mb-8 w-fit">
            <HardHat className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-black mb-4">
            Start Tracking Your{" "}
            <span className="text-gradient-secondary">Construction</span>{" "}
            <span className="text-gradient-accent">Budgets</span>
          </h2>
          <p className="text-foreground-muted text-lg mb-8">
            Join thousands of construction professionals managing their project
            finances with BuildTrack Pro.
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.li
                key={benefit}
                className="flex items-center gap-3 text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="w-8 h-8 rounded-lg bg-success-bg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                {benefit}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-block">
              <motion.div
                className="stat-icon-primary p-4 mx-auto mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <HardHat className="w-10 h-10 text-white" />
              </motion.div>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black">
              Create your <span className="text-gradient">account</span>
            </h1>
            <p className="mt-2 text-foreground-muted">
              Start tracking your budgets today
            </p>
          </div>

          {/* Form */}
          <motion.div
            className="card card-gradient p-6 sm:p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  className="flex items-center gap-2 p-4 rounded-xl bg-error-bg text-error text-sm border border-error/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="form-group">
                <label htmlFor="displayName" className="form-label">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="form-input pl-12"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-12"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input pl-12"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input pl-12"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn btn-secondary w-full btn-lg mt-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-foreground-muted text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-hover font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
