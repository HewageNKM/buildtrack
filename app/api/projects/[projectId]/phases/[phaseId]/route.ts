import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { PhaseService } from "@/services/PhaseService";

const phaseService = new PhaseService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; phaseId: string }> }
) {
  try {
    const { projectId, phaseId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const phase = await phaseService.updatePhase(
      projectId,
      phaseId,
      user.uid,
      user.email || undefined,
      body
    );
    return NextResponse.json(phase);
  } catch (error: unknown) {
    console.error("Error updating phase:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; phaseId: string }> }
) {
  try {
    const { projectId, phaseId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await phaseService.deletePhase(
      projectId,
      phaseId,
      user.uid,
      user.email || undefined
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting phase:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
