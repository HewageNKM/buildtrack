"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HardHat,
  BarChart3,
  Upload,
  FolderKanban,
  ArrowRight,
  CheckCircle2,
  Shield,
  Sparkles,
  TrendingUp,
  Sun,
  Moon,
  Zap,
  PieChart,
  FileText,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: FolderKanban,
      title: "Multi-Project Management",
      description:
        "Create and manage unlimited construction projects with individual budgets and timelines.",
      color: "#8b5cf6",
    },
    {
      icon: Upload,
      title: "Invoice Uploads",
      description:
        "Attach invoices and receipts to entries. Preview images and PDFs instantly.",
      color: "#ec4899",
    },
    {
      icon: PieChart,
      title: "Visual Analytics",
      description:
        "Beautiful charts for budget vs. spending, category breakdowns, and trends.",
      color: "#06b6d4",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Firebase authentication ensures only you can access your project data.",
      color: "#10b981",
    },
  ];

  const stats = [
    { value: "Free", label: "Forever", icon: Sparkles, color: "#8b5cf6" },
    {
      value: "Unlimited",
      label: "Projects",
      icon: FolderKanban,
      color: "#ec4899",
    },
    { value: "Real-time", label: "Updates", icon: Zap, color: "#06b6d4" },
    { value: "Secure", label: "Cloud", icon: Shield, color: "#10b981" },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Account",
      description: "Sign up free in seconds with just your email address.",
      icon: FileText,
    },
    {
      step: "02",
      title: "Add Project",
      description: "Create a new project and set your estimated budget.",
      icon: FolderKanban,
    },
    {
      step: "03",
      title: "Track Expenses",
      description: "Log expenses, attach invoices, and watch your analytics.",
      icon: BarChart3,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        minHeight: "100vh",
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
          }}
        />
        <div
          className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
          }}
        />
        <div
          className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50">
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 24px" }}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: "44px",
                  height: "44px",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
                }}
              >
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span style={{ fontSize: "20px", fontWeight: 800 }}>
                <span className="text-gradient">Build</span>
                <span className="text-gradient-secondary">Track</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={toggleTheme}
                className="flex items-center justify-center rounded-xl transition-colors"
                style={{
                  width: "44px",
                  height: "44px",
                  backgroundColor: "var(--background-secondary)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" style={{ color: "#fbbf24" }} />
                ) : (
                  <Moon className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                )}
              </motion.button>
              <Link
                href="/login"
                className="hidden sm:flex items-center justify-center rounded-xl transition-colors"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--background-secondary)",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl text-white transition-all"
                style={{
                  padding: "10px 20px",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  fontSize: "14px",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full"
              style={{
                padding: "8px 16px",
                marginBottom: "24px",
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#a78bfa",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              Construction Budget Management
            </motion.div>

            <h1
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: "24px",
              }}
            >
              Keep Your Projects{" "}
              <span className="text-gradient">On Budget,</span>{" "}
              <span className="text-gradient-secondary">On Time</span>
            </h1>

            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.7,
                marginBottom: "32px",
                color: "var(--foreground-muted)",
              }}
            >
              The simplest way to track expenses, upload invoices, and visualize
              spending across all your construction projects.{" "}
              <span style={{ color: "#10b981", fontWeight: 600 }}>
                100% Free.
              </span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-2xl text-white transition-all hover:scale-105"
                style={{
                  padding: "16px 28px",
                  background:
                    "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                  fontSize: "16px",
                  fontWeight: 700,
                  boxShadow: "0 8px 30px rgba(236, 72, 153, 0.4)",
                }}
              >
                <Sparkles className="w-5 h-5" />
                Start Tracking Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-2xl transition-all hover:scale-105"
                style={{
                  padding: "16px 28px",
                  backgroundColor: "var(--background-secondary)",
                  border: "2px solid var(--border)",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Right - Stats Grid */}
          <motion.div
            className="grid grid-cols-2 gap-5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="rounded-3xl"
                style={{
                  padding: "28px",
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div
                  className="flex items-center justify-center rounded-2xl mx-auto"
                  style={{
                    width: "56px",
                    height: "56px",
                    marginBottom: "16px",
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}99 100%)`,
                    boxShadow: `0 8px 25px ${stat.color}40`,
                  }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    marginBottom: "4px",
                  }}
                  className="text-gradient"
                >
                  {stat.value}
                </div>
                <div
                  style={{ fontSize: "14px", color: "var(--foreground-muted)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          backgroundColor: "var(--background-secondary)",
          padding: "100px 0",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}
        >
          <motion.div
            style={{ textAlign: "center", marginBottom: "64px" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 900,
                marginBottom: "16px",
              }}
            >
              Everything You Need to{" "}
              <span className="text-gradient-accent">Stay on Track</span>
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "var(--foreground-muted)",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Powerful features designed specifically for construction project
              budget management.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="rounded-3xl"
                style={{
                  padding: "32px 24px",
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              >
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: "64px",
                    height: "64px",
                    marginBottom: "20px",
                    background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}aa 100%)`,
                    boxShadow: `0 8px 25px ${feature.color}35`,
                  }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "12px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "var(--foreground-muted)",
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "100px 24px" }}
      >
        <motion.div
          style={{ textAlign: "center", marginBottom: "64px" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              marginBottom: "16px",
            }}
          >
            Get Started in <span className="text-gradient">3 Easy Steps</span>
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "var(--foreground-muted)",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Start tracking your construction budgets in just a few minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              style={{ textAlign: "center" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <motion.div
                className="flex items-center justify-center rounded-3xl mx-auto"
                style={{
                  width: "80px",
                  height: "80px",
                  marginBottom: "24px",
                  background:
                    index === 0
                      ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                      : index === 1
                      ? "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
                      : "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                  boxShadow:
                    index === 0
                      ? "0 12px 35px rgba(139, 92, 246, 0.4)"
                      : index === 1
                      ? "0 12px 35px rgba(236, 72, 153, 0.4)"
                      : "0 12px 35px rgba(6, 182, 212, 0.4)",
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "white",
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {item.step}
              </motion.div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "var(--foreground-muted)",
                }}
              >
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 100px" }}
      >
        <motion.div
          className="relative overflow-hidden rounded-[32px]"
          style={{
            padding: "clamp(48px, 8vw, 80px) clamp(24px, 5vw, 64px)",
            background:
              "linear-gradient(135deg, var(--card) 0%, var(--background-secondary) 100%)",
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-30 blur-3xl"
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-30 blur-3xl"
            style={{
              background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
            }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <div
                className="flex items-center justify-center rounded-2xl mx-auto"
                style={{
                  width: "72px",
                  height: "72px",
                  marginBottom: "24px",
                  background:
                    "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                  boxShadow: "0 12px 35px rgba(236, 72, 153, 0.4)",
                }}
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 900,
                marginBottom: "16px",
              }}
            >
              Ready to Take Control?
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "var(--foreground-muted)",
                maxWidth: "450px",
                margin: "0 auto 32px",
              }}
            >
              Join construction professionals who trust BuildTrack Pro to keep
              their projects on budget.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl text-white transition-all hover:scale-105"
              style={{
                padding: "18px 36px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                fontSize: "16px",
                fontWeight: 700,
                boxShadow: "0 12px 35px rgba(139, 92, 246, 0.4)",
              }}
            >
              Get Started — It&apos;s Free
              <CheckCircle2 className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        style={{ borderTop: "1px solid var(--border)", padding: "32px 0" }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: "32px",
                  height: "32px",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                }}
              >
                <HardHat className="w-4 h-4 text-white" />
              </div>
              <span
                style={{ fontSize: "14px", color: "var(--foreground-muted)" }}
              >
                © 2024 BuildTrack Pro. All rights reserved.
              </span>
            </div>
            <span
              style={{ fontSize: "14px", color: "var(--foreground-muted)" }}
            >
              Built with Next.js & Firebase
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
