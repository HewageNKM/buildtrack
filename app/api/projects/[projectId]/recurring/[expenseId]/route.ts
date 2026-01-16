import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { RecurringExpenseService } from "@/services/RecurringExpenseService";

const recurringService = new RecurringExpenseService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; expenseId: string }> }
) {
  try {
    const { projectId, expenseId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const expense = await recurringService.updateRecurringExpense(
      projectId,
      expenseId,
      user.uid,
      user.email || undefined,
      body
    );
    return NextResponse.json(expense);
  } catch (error: unknown) {
    console.error("Error updating recurring expense:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; expenseId: string }> }
) {
  try {
    const { projectId, expenseId } = await params;
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await recurringService.deleteRecurringExpense(
      projectId,
      expenseId,
      user.uid,
      user.email || undefined
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting recurring expense:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
