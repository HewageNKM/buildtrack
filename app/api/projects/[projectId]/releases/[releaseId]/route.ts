import { NextRequest, NextResponse } from "next/server";
import { BudgetReleaseService } from "@/services/BudgetReleaseService";
import { adminAuth } from "@/lib/firebase/admin";

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split("Bearer ")[1];
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

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

    await releaseService.deleteRelease(releaseId, projectId, auth.uid);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting release:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete release" },
      { status: 500 }
    );
  }
}
