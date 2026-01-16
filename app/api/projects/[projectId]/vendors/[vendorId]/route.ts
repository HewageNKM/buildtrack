import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { VendorService } from "@/services/VendorService";

const vendorService = new VendorService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; vendorId: string }> }
) {
  try {
    const { projectId, vendorId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const vendor = await vendorService.updateVendor(
      projectId,
      vendorId,
      user.uid,
      user.email || undefined,
      body
    );
    return NextResponse.json(vendor);
  } catch (error: unknown) {
    console.error("Error updating vendor:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; vendorId: string }> }
) {
  try {
    const { projectId, vendorId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await vendorService.deleteVendor(
      projectId,
      vendorId,
      user.uid,
      user.email || undefined
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting vendor:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
