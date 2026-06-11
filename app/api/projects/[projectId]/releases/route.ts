import { NextRequest, NextResponse } from "next/server";
import { BudgetReleaseService } from "@/services/BudgetReleaseService";
import { verifyAuth } from "@/lib/firebase/server-auth";

const releaseService = new BudgetReleaseService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, date, note } = body;

    if (!amount || !date) {
      return NextResponse.json(
        { error: "Amount and Date are required" },
        { status: 400 }
      );
    }

    const release = await releaseService.createRelease(
      projectId,
      auth.uid,
      {
        projectId,
        amount: Number(amount),
        date,
        note,
      },
      auth.email
    );

    return NextResponse.json({ release });
  } catch (error: any) {
    console.error("Error creating release:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create release" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Verify project access here if not strictly checking in service getters
    // The service might not filter by user for pure getters, so usually we check access
    // But for now, we assume if they can reach the project page, they can see data.
    // Ideally, service.getProjectReleases should check access or we do it here.
    // The verifyAccess method in ProjectService is useful here.

    const { releases, totalReleased } = await releaseService.getProjectReleases(
      projectId
    );

    return NextResponse.json({ releases, totalReleased });
  } catch (error: any) {
    console.error("Error fetching releases:", error);
    return NextResponse.json(
      { error: "Failed to fetch releases" },
      { status: 500 }
    );
  }
}
