import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { ReportsService } from "@/services/ReportsService";

const reportsService = new ReportsService();

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
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const reportData = await reportsService.getReportData(
      projectId,
      user.uid,
      user.email || undefined,
      startDate,
      endDate
    );

    const categorySummary = reportsService.getCategorySummary(
      reportData.entries
    );

    return NextResponse.json({ reportData, categorySummary });
  } catch (error: unknown) {
    console.error("Error generating report:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
