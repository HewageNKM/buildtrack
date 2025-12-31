"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  HardHat,
  LogOut,
  FolderKanban,
  User,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="glass sticky top-0 z-40">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <div
          className="flex items-center justify-between"
          style={{ height: "72px" }}
        >
          {/* Logo */}
          <Link
            href={user ? "/projects" : "/"}
            className="flex items-center gap-3"
          >
            <motion.div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <HardHat className="w-5 h-5 text-white" />
            </motion.div>
            <span
              style={{ fontSize: "20px", fontWeight: 800 }}
              className="hidden sm:block"
            >
              <span className="text-gradient">Build</span>
              <span className="text-gradient-secondary">Track</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-xl"
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "var(--background-secondary)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5" style={{ color: "#fbbf24" }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {user ? (
              <>
                <Link
                  href="/projects"
                  className="flex items-center gap-2 rounded-xl transition-colors"
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "var(--background-secondary)",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  <FolderKanban
                    className="w-4 h-4"
                    style={{ color: "#8b5cf6" }}
                  />
                  Projects
                </Link>

                <div
                  className="flex items-center gap-3"
                  style={{
                    paddingLeft: "16px",
                    borderLeft: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: "36px",
                        height: "36px",
                        background:
                          "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                      }}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className="hidden lg:block"
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        maxWidth: "120px",
                      }}
                    >
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                  </div>

                  <motion.button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center justify-center rounded-xl transition-colors"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                    }}
                    title="Logout"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" style={{ color: "#ef4444" }} />
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-xl transition-colors"
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
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-xl"
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "var(--background-secondary)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" style={{ color: "#fbbf24" }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: "#8b5cf6" }} />
              )}
            </motion.button>
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-xl"
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "var(--background-secondary)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div style={{ padding: "16px 0" }}>
                {user ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      className="flex items-center gap-3 rounded-xl"
                      style={{ padding: "12px" }}
                    >
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: "44px",
                          height: "44px",
                          background:
                            "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                        }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "15px" }}>
                          {user.displayName || "User"}
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "var(--foreground-muted)",
                          }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/projects"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl transition-colors"
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "var(--background-secondary)",
                        fontSize: "15px",
                        fontWeight: 500,
                      }}
                    >
                      <FolderKanban
                        className="w-5 h-5"
                        style={{ color: "#8b5cf6" }}
                      />
                      My Projects
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 rounded-xl transition-colors w-full text-left"
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        fontSize: "15px",
                        fontWeight: 500,
                        color: "#ef4444",
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-xl transition-colors"
                      style={{
                        padding: "14px",
                        backgroundColor: "var(--background-secondary)",
                        fontSize: "15px",
                        fontWeight: 600,
                      }}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-xl text-white"
                      style={{
                        padding: "14px",
                        background:
                          "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                        fontSize: "15px",
                        fontWeight: 600,
                        boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                      }}
                    >
                      Get Started Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
