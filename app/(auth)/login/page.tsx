"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Form, Input, Button, Alert, Divider, Typography, Space } from "antd";
import {
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError("");
    setLoading(true);

    try {
      await login(values.email, values.password);
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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--background)",
      }}
    >
      {/* Theme Toggle */}
      <Button
        type="text"
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        icon={
          theme === "dark" ? (
            <Sun style={{ color: "#faad14" }} />
          ) : (
            <Moon style={{ color: "#8b5cf6" }} />
          )
        }
      />

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo_rounded.png`}
              alt="BuildTrack Logo"
              width={80}
              height={80}
              style={{
                margin: "0 auto 20px",
                display: "block",
                boxShadow: "0 12px 35px rgba(139,92,246,0.4)",
                borderRadius: "50%",
              }}
            />
          </Link>
          <Title level={2} style={{ marginBottom: 8 }}>
            Welcome <span style={{ color: "#8b5cf6" }}>back</span>
          </Title>
          <Text type="secondary">Sign in to your account to continue</Text>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: 24,
            padding: 40,
            border: "1px solid var(--card-border)",
          }}
        >
          {/* Google Sign In */}
          <Button
            size="large"
            block
            icon={<GoogleOutlined />}
            onClick={handleGoogleSignIn}
            loading={googleLoading}
            disabled={loading}
            style={{ marginBottom: 24, height: 48 }}
          >
            Continue with Google
          </Button>

          <Divider plain>
            <Text type="secondary" style={{ fontSize: 12 }}>
              or
            </Text>
          </Divider>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email address" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="you@example.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                disabled={googleLoading}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Text type="secondary">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                style={{ color: "#8b5cf6", fontWeight: 600 }}
              >
                Create one
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
