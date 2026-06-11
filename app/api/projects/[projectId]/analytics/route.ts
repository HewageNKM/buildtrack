import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { ReportsService } from "@/services/ReportsService";
import { CategoryService } from "@/services/CategoryService";

const reportsService = new ReportsService();
const categoryService = new CategoryService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pass undefined for dates to get ALL project history
    const reportData = await reportsService.getReportData(
      projectId,
      user.uid,
      user.email || undefined,
      undefined,
      undefined,
    );

    // Get categories to map correctly
    const categories = await categoryService.getCategories(
      projectId,
      user.uid,
      user.email || undefined,
    );

    // Process all entries into analytical chart data
    const analyticsData = reportsService.getAnalyticsData(
      reportData.entries,
      categories,
    );

    return NextResponse.json(analyticsData);
  } catch (error: unknown) {
    console.error("Error generating analytics:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
