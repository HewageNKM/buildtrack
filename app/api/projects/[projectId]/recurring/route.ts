import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/server-auth";
import { RecurringExpenseService } from "@/services/RecurringExpenseService";

const recurringService = new RecurringExpenseService();

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

    const expenses = await recurringService.getRecurringExpenses(
      projectId,
      user.uid,
      user.email || undefined
    );
    return NextResponse.json(expenses);
  } catch (error: unknown) {
    console.error("Error fetching recurring expenses:", error);
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
    const expense = await recurringService.createRecurringExpense(
      projectId,
      user.uid,
      user.email || undefined,
      body
    );
    return NextResponse.json(expense);
  } catch (error: unknown) {
    console.error("Error creating recurring expense:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
