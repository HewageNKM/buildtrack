import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { PhaseService } from "@/services/PhaseService";

const phaseService = new PhaseService();

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

    const phases = await phaseService.getPhases(
      projectId,
      user.uid,
      user.email || undefined
    );
    return NextResponse.json(phases);
  } catch (error: unknown) {
    console.error("Error fetching phases:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const phase = await phaseService.addPhase(
      projectId,
      user.uid,
      user.email || undefined,
      body
    );
    return NextResponse.json(phase);
  } catch (error: unknown) {
    console.error("Error creating phase:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
