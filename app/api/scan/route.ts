import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { ScanService } from "@/services/ScanService";

const scanService = new ScanService();

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoriesStr = formData.get("categories") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const categories = categoriesStr ? JSON.parse(categoriesStr) : [];

    // 3. Scan Receipt via Service
    const parsedData = await scanService.scanReceipt(file, categories);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/scan:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
