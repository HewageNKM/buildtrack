"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Form,
  Input,
  Button,
  Alert,
  Divider,
  Typography,
  Space,
  Row,
  Col,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  GoogleOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (values: {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setError("");

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (values.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(values.email, values.password, values.displayName);
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

  const benefits = [
    "Unlimited projects",
    "Invoice uploads",
    "Visual analytics",
    "Secure & private",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
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
          zIndex: 50,
        }}
        icon={
          theme === "dark" ? (
            <Sun style={{ color: "#faad14" }} />
          ) : (
            <Moon style={{ color: "#8b5cf6" }} />
          )
        }
      />

      {/* Left Side - Benefits (Desktop) */}
      <div
        style={{
          display: "none",
          width: "50%",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
        }}
        className="lg:flex"
      >
        <div style={{ maxWidth: 400 }}>
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo_rounded.png`}
            alt="BuildTrack Logo"
            width={80}
            height={80}
            style={{
              marginBottom: 32,
              display: "block",
              boxShadow: "0 12px 35px rgba(139,92,246,0.4)",
              borderRadius: "50%",
            }}
          />
          <Title level={2}>
            Start Tracking Your{" "}
            <span style={{ color: "#06b6d4" }}>Construction</span>{" "}
            <span style={{ color: "#ec4899" }}>Budgets</span>
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: 16, display: "block", marginBottom: 32 }}
          >
            Join thousands of construction professionals managing their project
            finances with BuildTrack Pro.
          </Text>
          <Space direction="vertical" size="middle">
            {benefits.map((benefit) => (
              <Space key={benefit}>
                <CheckCircleOutlined
                  style={{ color: "#10b981", fontSize: 18 }}
                />
                <Text>{benefit}</Text>
              </Space>
            ))}
          </Space>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
        className="lg:w-1/2"
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Mobile Logo */}
          <div
            style={{ textAlign: "center", marginBottom: 32 }}
            className="lg:hidden"
          >
            <Link href="/">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo_rounded.png`}
                alt="BuildTrack Logo"
                width={64}
                height={64}
                style={{
                  margin: "0 auto 16px",
                  display: "block",
                  boxShadow: "0 12px 35px rgba(139,92,246,0.4)",
                  borderRadius: "50%",
                }}
              />
            </Link>
          </div>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              Create your <span style={{ color: "#ec4899" }}>account</span>
            </Title>
            <Text type="secondary">Start tracking your budgets today</Text>
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

            <Form
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Form.Item
                name="displayName"
                label="Full Name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="John Doe"
                  size="large"
                />
              </Form.Item>

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

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: "Required" },
                      { min: 6, message: "Min 6 characters" },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="••••••••"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="••••••••"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  disabled={googleLoading}
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  style={{
                    background: "linear-gradient(90deg, #ec4899, #f43f5e)",
                    borderColor: "transparent",
                  }}
                >
                  Create Account
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Text type="secondary">
                Already have an account?{" "}
                <Link
                  href="/login"
                  style={{ color: "#8b5cf6", fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
