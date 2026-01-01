import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { TeamService } from "@/services/TeamService";
import { ProjectService } from "@/services/ProjectService";

const teamService = new TeamService();
const projectService = new ProjectService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;

    // Reuse verifying logic or just get project
    const project = await projectService.getProject(projectId, user.uid);

    if (!project)
      return NextResponse.json(
        { error: "Access denied or not found" },
        { status: 403 }
      );

    return NextResponse.json({ teamMembers: project.teamMembers || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const { email, role } = await request.json();

    if (!email || !role)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const member = await teamService.inviteMember(
      projectId,
      user.uid,
      user.email || "",
      email,
      role
    );

    return NextResponse.json({ message: "Invited", member });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userIdOrEmail =
      searchParams.get("userId") || searchParams.get("email");

    if (!userIdOrEmail)
      return NextResponse.json(
        { error: "ID or email required" },
        { status: 400 }
      );

    await teamService.removeMember(projectId, user.uid, userIdOrEmail);

    return NextResponse.json({ message: "Removed" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const { userId, role } = await request.json();

    if (!userId || !role)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await teamService.updateRole(projectId, user.uid, userId, role);

    return NextResponse.json({ message: "Role updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
