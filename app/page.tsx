"use client";

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
  Zap,
  Sparkles,
  TrendingUp,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: FolderKanban,
      title: "Multi-Project Management",
      description:
        "Create and manage unlimited construction projects, each with its own budget and tracking.",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Upload,
      title: "Invoice Uploads",
      description:
        "Attach invoices and receipts to budget entries. Preview images and PDFs instantly.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      description:
        "Beautiful charts showing budget vs. spending, category breakdowns, and timeline trends.",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your data is protected with Firebase authentication. Only you can see your projects.",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const stats = [
    {
      value: "100%",
      label: "Free to Use",
      gradient: "from-violet-500 to-purple-500",
    },
    { value: "∞", label: "Projects", gradient: "from-pink-500 to-rose-500" },
    {
      value: "Real-time",
      label: "Updates",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      value: "Secure",
      label: "Storage",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
        <div
          className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="container py-6">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="stat-icon-primary p-2">
              <HardHat className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl">
              <span className="text-gradient">Build</span>
              <span className="text-gradient-secondary">Track</span>
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
                <Sun className="w-5 h-5 text-warning" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </button>
            <Link href="/login" className="btn btn-ghost btn-sm hidden sm:flex">
              Log in
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-bg to-secondary-bg text-primary text-sm font-semibold mb-8 border border-primary/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4" />
            Track your construction budgets effortlessly
            <Zap className="w-4 h-4 text-warning" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-8">
            Keep Your Projects <span className="text-gradient">On Budget,</span>{" "}
            <span className="text-gradient-secondary">On Time</span>
          </h1>

          <p className="text-lg sm:text-xl text-foreground-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            The simplest way to track expenses, upload invoices, and visualize
            spending across all your construction projects.{" "}
            <span className="text-primary font-semibold">Free forever.</span>
          </p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/register"
              className="btn btn-secondary btn-lg w-full sm:w-auto glow-secondary"
            >
              <Sparkles className="w-5 h-5" />
              Start Tracking Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="btn btn-outline btn-lg w-full sm:w-auto"
            >
              Sign In to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="container py-12">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="card card-hover text-center p-6"
              variants={itemVariants}
            >
              <div
                className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}
              >
                {stat.value}
              </div>
              <div className="text-sm text-foreground-muted font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="container py-16 md:py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Everything You Need to{" "}
            <span className="text-gradient-accent">Stay on Track</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Powerful features designed specifically for construction project
            budget management.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card card-hover group p-8"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-5">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="container py-16 md:py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Get Started in <span className="text-gradient">Minutes</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Three simple steps to start tracking your construction budgets.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            {
              step: 1,
              title: "Create Account",
              desc: "Sign up free with just your email",
              gradient: "from-violet-500 to-purple-500",
            },
            {
              step: 2,
              title: "Add Project",
              desc: "Create a project and set your budget",
              gradient: "from-pink-500 to-rose-500",
            },
            {
              step: 3,
              title: "Track Expenses",
              desc: "Log entries with optional invoices",
              gradient: "from-cyan-500 to-blue-500",
            },
          ].map((item) => (
            <motion.div
              key={item.step}
              className="text-center"
              variants={itemVariants}
            >
              <motion.div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} text-white font-black text-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {item.step}
              </motion.div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-foreground-muted">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container py-16 md:py-24">
        <motion.div
          className="card card-gradient p-8 md:p-16 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <TrendingUp className="w-16 h-16 mx-auto mb-6 text-primary" />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Ready to Take Control of Your Budget?
            </h2>
            <p className="text-foreground-muted text-lg mb-10 max-w-xl mx-auto">
              Join thousands of construction professionals who trust BuildTrack
              Pro to keep their projects on budget.
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
      <footer className="container py-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="stat-icon-primary p-1.5">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-foreground-muted">
              © 2024 BuildTrack Pro. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-foreground-muted">
            <span>Built with Next.js & Firebase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
