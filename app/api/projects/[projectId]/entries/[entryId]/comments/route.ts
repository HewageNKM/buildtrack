import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { CommentService } from "@/services/CommentService";

const commentService = new CommentService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; entryId: string }> }
) {
  try {
    const { projectId, entryId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await commentService.getComments(
      projectId,
      entryId,
      user.uid,
      user.email || undefined
    );
    return NextResponse.json(comments);
  } catch (error: unknown) {
    console.error("Error fetching comments:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; entryId: string }> }
) {
  try {
    const { projectId, entryId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const comment = await commentService.addComment(
      projectId,
      entryId,
      user.uid,
      user.name || user.email || "Unknown",
      content.trim(),
      user.email || undefined
    );

    return NextResponse.json(comment);
  } catch (error: unknown) {
    console.error("Error adding comment:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
