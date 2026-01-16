import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { ApprovalService } from "@/services/ApprovalService";

const approvalService = new ApprovalService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; entryId: string }> }
) {
  try {
    const { projectId, entryId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const result = await approvalService.processApproval(
      projectId,
      entryId,
      user.uid,
      user.email || undefined,
      action,
      rejectionReason
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error processing approval:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
