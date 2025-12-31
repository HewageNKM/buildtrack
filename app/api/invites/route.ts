import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { InviteRepository } from "@/repositories/InviteRepository";
import { TeamService } from "@/services/TeamService"; // Actually handling invite logic here might be better, but sticking to pattern

// Extending TeamService or InviteRepo usage
import { adminDb } from "@/lib/firebase/admin"; // Fallback for specific logic like accept/decline if not in service yet
// Assuming we'll add accept/decline to Service or handle here.
// Adding accept/decline into TeamService is cleaner. Let's update TeamService?
// No, I can implement it here using repositories for now or add to TeamService in next step if needed.
// Let's implement logic here properly using Repos since TeamService doesn't have accept/decline yet in my previous step.

// WAITING: I realized TeamService missed acceptInvite/declineInvite.
// I will implement the logic here using repositories directly similar to before but cleaner,
// OR I should have added it to TeamService. For now, I'll keep logic here but use Repositories where possible.

import { ProjectRepository } from "@/repositories/ProjectRepository";

const inviteRepo = new InviteRepository();
const projectRepo = new ProjectRepository();

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return await adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);
  } catch {
    return null;
  }
}

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
