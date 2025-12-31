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
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: FolderKanban,
      title: "Multi-Project Management",
      description:
        "Create and manage unlimited construction projects with individual budgets.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Upload,
      title: "Invoice Uploads",
      description:
        "Attach invoices and receipts. Preview images and PDFs instantly.",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      description:
        "Beautiful charts for budget vs. spending and category breakdowns.",
      gradient: "from-cyan-400 to-blue-600",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Firebase authentication. Only you can see your projects.",
      gradient: "from-emerald-400 to-teal-600",
    },
  ];

  const stats = [
    { value: "100%", label: "Free Forever", icon: Sparkles },
    { value: "∞", label: "Unlimited Projects", icon: FolderKanban },
    { value: "Real-time", label: "Live Updates", icon: Zap },
    { value: "Secure", label: "Cloud Storage", icon: Shield },
  ];

  const steps = [
    {
      step: 1,
      title: "Create Account",
      desc: "Sign up free with just your email",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      step: 2,
      title: "Add Project",
      desc: "Create a project and set your budget",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      step: 3,
      title: "Track Expenses",
      desc: "Log entries with optional invoices",
      gradient: "from-cyan-400 to-blue-600",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-float"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        />
        <div
          className="absolute top-[30%] right-[5%] w-[500px] h-[500px] rounded-full opacity-15 blur-3xl animate-float"
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute bottom-[10%] left-[20%] w-[700px] h-[700px] rounded-full opacity-15 blur-3xl animate-float"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            animationDelay: "4s",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div
                className="stat-icon-primary"
                style={{ width: "44px", height: "44px" }}
              >
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl lg:text-2xl">
                <span className="text-gradient">Build</span>
                <span className="text-gradient-secondary">Track</span>
                <span
                  style={{ color: "var(--foreground-muted)" }}
                  className="font-normal ml-1 hidden sm:inline"
                >
                  Pro
                </span>
              </span>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={toggleTheme}
                className="btn btn-icon btn-ghost"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun
                    className="w-5 h-5"
                    style={{ color: "var(--warning)" }}
                  />
                ) : (
                  <Moon
                    className="w-5 h-5"
                    style={{ color: "var(--primary)" }}
                  />
                )}
              </button>
              <Link href="/login" className="btn btn-ghost hidden sm:flex">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary">
                <Sparkles className="w-4 h-4" />
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{
                background: "var(--primary-bg)",
                color: "var(--primary)",
                border: "1px solid var(--primary)",
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              Construction Budget Management
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Keep Projects <span className="text-gradient">On Budget,</span>
              <br />
              <span className="text-gradient-secondary">On Time</span>
            </h1>

            <p
              className="text-lg lg:text-xl mb-8 leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              The simplest way to track expenses, upload invoices, and visualize
              spending across all your construction projects.{" "}
              <span style={{ color: "var(--success)", fontWeight: 600 }}>
                Free forever.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="btn btn-secondary btn-lg glow-secondary"
              >
                <Sparkles className="w-5 h-5" />
                Start Tracking Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="btn btn-outline btn-lg">
                Sign In to Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Stats Cards */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="card card-hover p-5 lg:p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <div
                  className="stat-icon-primary mx-auto mb-3"
                  style={{ width: "48px", height: "48px" }}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-gradient mb-1">
                  {stat.value}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black mb-4">
            Everything You Need to{" "}
            <span className="text-gradient-accent">Stay on Track</span>
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--foreground-muted)" }}
          >
            Powerful features designed for construction project budget
            management.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card card-hover group p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p
                style={{ color: "var(--foreground-muted)" }}
                className="text-sm leading-relaxed"
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black mb-4">
            Get Started in <span className="text-gradient">3 Easy Steps</span>
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--foreground-muted)" }}
          >
            Start tracking your construction budgets in minutes.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                className="text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 left-[60%] w-[calc(80%+3rem)] h-0.5"
                    style={{ background: "var(--border)" }}
                  />
                )}
                <motion.div
                  className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} text-white font-black text-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p
                  style={{ color: "var(--foreground-muted)" }}
                  className="text-base"
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          className="card card-gradient p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Decorative elements */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 blur-3xl"
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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
                className="stat-icon-secondary mx-auto mb-6"
                style={{ width: "72px", height: "72px" }}
              >
                <TrendingUp className="w-9 h-9 text-white" />
              </div>
            </motion.div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black mb-4">
              Ready to Take Control?
            </h2>
            <p
              className="text-lg lg:text-xl mb-8 max-w-xl mx-auto"
              style={{ color: "var(--foreground-muted)" }}
            >
              Join construction professionals who trust BuildTrack Pro to keep
              their projects on budget.
            </p>
            <Link
              href="/register"
              className="btn btn-primary btn-lg inline-flex glow-primary"
            >
              Get Started — It&apos;s Free
              <CheckCircle2 className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="stat-icon-primary"
              style={{ width: "32px", height: "32px", padding: "6px" }}
            >
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              © 2024 BuildTrack Pro. All rights reserved.
            </span>
          </div>
          <div className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            Built with Next.js & Firebase
          </div>
        </div>
      </footer>
    </div>
  );
}
