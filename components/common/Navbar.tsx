"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  HardHat,
  LogOut,
  FolderKanban,
  User,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 bg-background/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user ? "/projects" : "/"}
          className="flex items-center gap-3 group"
        >
          <motion.div
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-accent-violet to-primary shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-white/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <HardHat className="w-6 h-6 text-white drop-shadow-md" />
          </motion.div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none">
              Build<span className="text-accent-cyan">Track</span>
            </span>
            <span className="text-[10px] font-medium text-foreground-muted tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity -mt-3.5 translate-y-3.5">
              Pro
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/projects"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent-violet/50 transition-all group"
              >
                <FolderKanban className="w-4 h-4 text-accent-violet group-hover:text-white transition-colors" />
                <span className="text-sm font-semibold text-foreground group-hover:text-white">
                  Projects
                </span>
              </Link>

              <div className="h-8 w-px bg-white/10" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/5 bg-white/5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-accent-violet to-accent-pink shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground pr-2">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </div>

                <motion.button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all"
                  title="Logout"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-foreground-muted hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-violet to-primary text-white text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-white/10 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-foreground"
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
            className="md:hidden overflow-hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
          >
            <div className="p-4 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-violet to-accent-pink flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-accent-violet/10 text-accent-violet font-medium hover:bg-accent-violet/20"
                  >
                    <FolderKanban className="w-5 h-5" />
                    My Projects
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full p-3.5 rounded-xl bg-white/5 text-center font-semibold text-foreground hover:bg-white/10"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-accent-violet to-primary text-white text-center font-bold"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
