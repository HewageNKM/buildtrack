import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { VendorService } from "@/services/VendorService";

const vendorService = new VendorService();

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

    const vendors = await vendorService.getVendors(
      projectId,
      user.uid,
      user.email || undefined
    );
    return NextResponse.json(vendors);
  } catch (error: unknown) {
    console.error("Error fetching vendors:", error);
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
    const vendor = await vendorService.addVendor(
      projectId,
      user.uid,
      user.email || undefined,
      body
    );
    return NextResponse.json(vendor);
  } catch (error: unknown) {
    console.error("Error creating vendor:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
