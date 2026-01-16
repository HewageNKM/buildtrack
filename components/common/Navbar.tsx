"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserOutlined,
  LogoutOutlined,
  ProjectOutlined,
  MenuOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Space,
  Drawer,
  Typography,
  theme as antTheme,
} from "antd";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, HardHat } from "lucide-react";

const { Text } = Typography;
const { Header } = Layout;
const { useToken } = antTheme;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { token } = useToken();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userMenu = {
    items: [
      {
        key: "projects",
        label: "My Projects",
        icon: <ProjectOutlined />,
        onClick: () => router.push("/projects"),
      },
      {
        type: "divider" as const,
      },
      {
        key: "logout",
        label: "Logout",
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  // Determine active menu item
  const selectedKeys = pathname === "/projects" ? ["projects"] : [];

  return (
    <Header
      style={{
        position: "fixed",
        top: 0,
        zIndex: 50,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 72,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Logo */}
      <Link
        href={user ? "/projects" : "/"}
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
          }}
        >
          <HardHat style={{ width: 20, height: 20, color: "white" }} />
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: token.colorText }}>
          Build<span style={{ color: "#06b6d4" }}>Track</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        {/* Theme Toggle */}
        <Button
          type="text"
          shape="circle"
          onClick={toggleTheme}
          icon={
            theme === "dark" ? (
              <Sun style={{ width: 20, height: 20, color: "#faad14" }} />
            ) : (
              <Moon style={{ width: 20, height: 20, color: "#8b5cf6" }} />
            )
          }
        />

        {user ? (
          <>
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys}
              style={{
                background: "transparent",
                borderBottom: "none",
                minWidth: 100,
              }}
              items={[
                {
                  key: "projects",
                  label: "Projects",
                  icon: <ProjectOutlined />,
                  onClick: () => router.push("/projects"),
                },
              ]}
            />

            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Button
                type="text"
                style={{ height: "auto", padding: "4px 8px" }}
              >
                <Space>
                  <Avatar
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                      verticalAlign: "middle",
                    }}
                    icon={<UserOutlined />}
                  >
                    {user.displayName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                    <Text strong style={{ display: "block", fontSize: 13 }}>
                      {user.displayName || "User"}
                    </Text>
                  </div>
                </Space>
              </Button>
            </Dropdown>
          </>
        ) : (
          <Space>
            <Link href="/login">
              <Button type="text" icon={<LoginOutlined />}>
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                style={{
                  background: "linear-gradient(90deg, #8b5cf6, #6366f1)",
                  borderColor: "transparent",
                }}
              >
                Get Started
              </Button>
            </Link>
          </Space>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-4">
        <Button
          type="text"
          shape="circle"
          onClick={toggleTheme}
          icon={
            theme === "dark" ? (
              <Sun style={{ width: 20, height: 20, color: "#faad14" }} />
            ) : (
              <Moon style={{ width: 20, height: 20, color: "#8b5cf6" }} />
            )
          }
        />
        <Button
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              }}
              icon={<UserOutlined />}
            />
            <Text strong>{user?.displayName || "Menu"}</Text>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          style={{ borderRight: "none" }}
          onClick={() => setMobileMenuOpen(false)}
          items={
            user
              ? [
                  {
                    key: "projects",
                    label: "My Projects",
                    icon: <ProjectOutlined />,
                    onClick: () => router.push("/projects"),
                  },
                  {
                    key: "logout",
                    label: "Logout",
                    icon: <LogoutOutlined />,
                    danger: true,
                    onClick: handleLogout,
                  },
                ]
              : [
                  {
                    key: "login",
                    label: "Log in",
                    icon: <LoginOutlined />,
                    onClick: () => router.push("/login"),
                  },
                  {
                    key: "register",
                    label: "Get Started",
                    icon: <UserAddOutlined />,
                    onClick: () => router.push("/register"),
                  },
                ]
          }
        />
      </Drawer>
    </Header>
  );
}
