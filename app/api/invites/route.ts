import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { InviteRepository } from "@/repositories/InviteRepository";
import { ProjectRepository } from "@/repositories/ProjectRepository";

const inviteRepo = new InviteRepository();
const projectRepo = new ProjectRepository();

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invites = await inviteRepo.getPendingByEmail(user.email);
    return NextResponse.json({ invites });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { inviteId, action } = await request.json();

    if (!inviteId || !action)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const invite = await inviteRepo.getById(inviteId);
    if (!invite)
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    if (invite.invitedEmail !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    if (action === "accept") {
      const project = await projectRepo.getById(invite.projectId);
      if (project) {
        // Update the temporary member entry with actual user ID
        const teamMembers = project.teamMembers || [];
        const updatedMembers = teamMembers.map((m) => {
          if (m.email === user.email?.toLowerCase()) {
            return {
              ...m,
              userId: user.uid,
              displayName: user.name || user.email?.split("@")[0],
            };
          }
          return m;
        });
        await projectRepo.update(invite.projectId, {
          teamMembers: updatedMembers,
        });
      }

      await inviteRepo.update(inviteId, { status: "accepted" });
      // Note: acceptedAt would need to be added to type/repo if strictly typed, ignoring for now as simple update
    } else {
      // Decline
      await projectRepo.removeTeamMember(invite.projectId, user.email);
      await inviteRepo.update(inviteId, { status: "declined" });
    }

    return NextResponse.json({ message: "Processed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
