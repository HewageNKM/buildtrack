import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { ApprovalService } from "@/services/ApprovalService";

const approvalService = new ApprovalService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get("stats") === "true";

    const pending = await approvalService.getPendingApprovals(
      projectId,
      user.uid,
      user.email || undefined
    );

    const response: Record<string, unknown> = { pending };

    if (includeStats) {
      const stats = await approvalService.getApprovalStats(
        projectId,
        user.uid,
        user.email || undefined
      );
      response.stats = stats;
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error fetching approvals:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
