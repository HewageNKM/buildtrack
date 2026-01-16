import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildTrack | Construction Budget Tracker",
  description:
    "Track and manage your construction project budgets with ease. Upload invoices, visualize spending, and stay on top of your construction costs.",
  keywords: [
    "construction",
    "budget",
    "tracker",
    "project management",
    "invoices",
    "cost tracking",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative overflow-x-hidden selection:bg-accent-violet selection:text-white`}
      >
        {/* Global Background Effects */}
        <div className="fixed inset-0 -z-50 h-full w-full bg-background">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-accent-violet/20 blur-[100px] animate-pulse" />
          <div
            className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-accent-cyan/20 blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        </div>

        <AntdRegistry>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorPrimary: "#8b5cf6",
                colorSuccess: "#10b981",
                colorError: "#ef4444",
                colorWarning: "#f59e0b",
                colorInfo: "#06b6d4",
                borderRadius: 12,
                fontFamily: "var(--font-geist-sans)",
              },
              components: {
                Button: {
                  borderRadius: 12,
                },
                Input: {
                  borderRadius: 12,
                },
                Select: {
                  borderRadius: 12,
                },
                Modal: {
                  borderRadiusLG: 24,
                },
                Table: {
                  borderRadius: 12,
                },
                Card: {
                  borderRadiusLG: 16,
                },
              },
            }}
          >
            <ThemeProvider>
              <AuthProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "var(--card)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "var(--shadow-lg)",
                    },
                    success: {
                      iconTheme: {
                        primary: "var(--success)",
                        secondary: "white",
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: "var(--error)",
                        secondary: "white",
                      },
                    },
                  }}
                />
              </AuthProvider>
            </ThemeProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
