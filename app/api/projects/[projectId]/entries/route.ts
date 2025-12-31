import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { EntryService } from "@/services/EntryService";

const entryService = new EntryService();

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return await adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const entries = await entryService.getEntries(projectId, user.uid);

    return NextResponse.json({ entries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const formData = await request.formData();

    const category = formData.get("category");
    const description = formData.get("description");
    const amount = parseFloat(formData.get("amount") as string);
    const date = formData.get("date");
    const invoiceFile = formData.get("invoice") as File | null;

    let fileData;
    if (invoiceFile && invoiceFile.size > 0) {
      const buffer = Buffer.from(await invoiceFile.arrayBuffer());
      fileData = {
        buffer,
        name: invoiceFile.name,
        type: invoiceFile.type,
      };
    }

    const entry = await entryService.createEntry(
      projectId,
      user.uid,
      user.email || "",
      { category, description, amount, date },
      fileData
    );

    return NextResponse.json({ message: "Created", entry });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");

    if (!entryId)
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });

    await entryService.deleteEntry(projectId, entryId, user.uid);

    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
