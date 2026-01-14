import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "@/services/CategoryService";

const categoryService = new CategoryService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; categoryId: string }> }
) {
  try {
    const { projectId, categoryId } = await params;
    const userId = request.headers.get("x-user-id");
    const email = request.headers.get("x-user-email") || undefined;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await categoryService.deleteCategory(categoryId, projectId, userId, email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
