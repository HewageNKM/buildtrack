import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { CommentService } from "@/services/CommentService";

const commentService = new CommentService();

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; entryId: string; commentId: string }>;
  }
) {
  try {
    const { projectId, entryId, commentId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await commentService.deleteComment(
      projectId,
      entryId,
      commentId,
      user.uid,
      user.email || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting comment:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
