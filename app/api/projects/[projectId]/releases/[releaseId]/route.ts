import { NextRequest, NextResponse } from "next/server";
import { BudgetReleaseService } from "@/services/BudgetReleaseService";
import { verifyAuth } from "@/lib/firebase/server-auth";

const releaseService = new BudgetReleaseService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; releaseId: string }> }
) {
  try {
    const { projectId, releaseId } = await params;
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await releaseService.deleteRelease(
      releaseId,
      projectId,
      auth.uid,
      auth.email
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting release:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete release" },
      { status: 500 }
    );
  }
}
