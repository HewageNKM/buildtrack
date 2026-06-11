import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { AlertsService } from "@/services/AlertsService";

const alertsService = new AlertsService();

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nearThreshold = parseInt(searchParams.get("nearThreshold") || "80");
    const criticalThreshold = parseInt(
      searchParams.get("criticalThreshold") || "100"
    );

    const result = await alertsService.checkAllProjectAlerts(user.uid, {
      nearThreshold,
      criticalThreshold,
    });

    const summary = alertsService.getAlertSummary(result.alerts);

    return NextResponse.json({
      ...result,
      summary,
    });
  } catch (error: unknown) {
    console.error("Error checking alerts:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
