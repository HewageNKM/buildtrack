"use client";

import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  List,
  Avatar,
  Tag,
  Space,
  Alert,
  Typography,
  Popconfirm,
  Divider,
  Tooltip,
} from "antd";
import {
  UserAddOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckOutlined,
  CrownOutlined,
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { TeamMember, TeamMemberRole } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const { Text, Title } = Typography;

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  teamMembers: TeamMember[];
  currentUserRole: TeamMemberRole;
  onUpdate: () => void;
}

const roleConfig: Record<
  TeamMemberRole,
  { label: string; color: string; icon: React.ReactNode }
> = {
  owner: { label: "Owner", color: "gold", icon: <CrownOutlined /> },
  editor: { label: "Editor", color: "purple", icon: <EditOutlined /> },
  viewer: { label: "Viewer", color: "cyan", icon: <EyeOutlined /> },
};

export default function TeamManagementModal({
  isOpen,
  onClose,
  projectName,
  projectId,
  teamMembers,
  currentUserRole,
  onUpdate,
}: TeamManagementModalProps) {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canManageTeam = currentUserRole === "owner";

  const handleInvite = async (values: {
    email: string;
    role: TeamMemberRole;
  }) => {
    if (
      teamMembers.some(
        (m) => m.email.toLowerCase() === values.email.toLowerCase()
      )
    ) {
      toast.error("This user is already a team member");
      return;
    }

    setLoading(true);
    try {
      await api.team.invite(projectId, values.email.trim(), values.role);
      toast.success(`Invite sent to ${values.email}`);
      form.resetFields();
      onUpdate();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      await api.team.remove(projectId, userId);
      if (userId === user?.uid) {
        toast.success("Left project successfully");
        onClose();
        window.location.href = "/projects";
      } else {
        toast.success("Team member removed");
        onUpdate();
      }
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(
      `Join my project "${projectName}" on BuildTrack Pro!`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          <span>Team Management</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnClose
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        {projectName}
      </Text>

      {/* Invite Form */}
      {canManageTeam && (
        <>
          <Form
            form={form}
            layout="inline"
            onFinish={handleInvite}
            initialValues={{ role: "editor" }}
            style={{
              marginBottom: 16,
              gap: 8,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Email required" },
                { type: "email", message: "Invalid email" },
              ]}
              style={{ flex: 1, minWidth: 200, marginRight: 0 }}
            >
              <Input placeholder="teammate@example.com" />
            </Form.Item>
            <Form.Item name="role" style={{ marginRight: 0 }}>
              <Select style={{ width: 100 }}>
                <Select.Option value="editor">Editor</Select.Option>
                <Select.Option value="viewer">Viewer</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ marginRight: 0 }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<UserAddOutlined />}
                  loading={loading}
                >
                  Invite
                </Button>
                <Tooltip title="Copy invite message">
                  <Button
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={handleCopyInvite}
                  />
                </Tooltip>
              </Space>
            </Form.Item>
          </Form>
          <Divider style={{ margin: "16px 0" }} />
        </>
      )}

      {/* Team Members List */}
      <Title level={5} style={{ marginBottom: 12 }}>
        Current Members ({teamMembers.length})
      </Title>

      <List
        dataSource={teamMembers}
        renderItem={(member) => {
          const role = roleConfig[member.role];
          return (
            <List.Item
              key={member.userId}
              actions={
                canManageTeam && member.role !== "owner"
                  ? [
                      <Popconfirm
                        key="remove"
                        title="Remove member?"
                        description="Are you sure you want to remove this team member?"
                        onConfirm={() => handleRemove(member.userId)}
                        okText="Remove"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          loading={removingId === member.userId}
                        />
                      </Popconfirm>,
                    ]
                  : undefined
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: "#8b5cf6" }}>
                    {(member.displayName || member.email)
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>
                }
                title={member.displayName || member.email.split("@")[0]}
                description={member.email}
              />
              <Tag icon={role.icon} color={role.color}>
                {role.label}
              </Tag>
            </List.Item>
          );
        }}
      />

      {/* Permission Legend */}
      <Divider />
      <Title level={5} style={{ marginBottom: 12 }}>
        Permission Matrix
      </Title>
      <Space direction="vertical" size="small">
        <Text>
          <CrownOutlined style={{ color: "#faad14", marginRight: 8 }} />
          <strong>Owner</strong> — Full administrative access & billing control.
        </Text>
        <Text>
          <EditOutlined style={{ color: "#8b5cf6", marginRight: 8 }} />
          <strong>Editor</strong> — Can create, edit, and delete budget entries.
        </Text>
        <Text>
          <EyeOutlined style={{ color: "#06b6d4", marginRight: 8 }} />
          <strong>Viewer</strong> — Read-only access to charts and history.
        </Text>
      </Space>
    </Modal>
  );
}
