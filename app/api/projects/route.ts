import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { ProjectService } from "@/services/ProjectService";
import { CurrencyCode, DEFAULT_CURRENCY } from "@/lib/currency";

const projectService = new ProjectService();

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split("Bearer ")[1];
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const email = user.email || undefined;

    // Pass user ID and email (if available) to service
    const { owned, shared } = await projectService.getProjects(user.uid, email);

    // Calculate stats if needed (currently handling in repo/service or here)
    // For now simple return, can enhance with entry counts via EntryService later
    return NextResponse.json({
      projects: [...owned, ...shared], // Simplified for now, logic differs slightly from previous implementation
      total: owned.length + shared.length,
      owned: owned.length,
      shared: shared.length,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    const body = await request.json();
    const { name, description, estimatedBudget, currency, startDate, endDate } =
      body;

    if (!name)
      return NextResponse.json({ error: "Name required" }, { status: 400 });

    const project = await projectService.createProject(user.uid, user.email, {
      name,
      description,
      estimatedBudget: Number(estimatedBudget) || 0,
      currency: (currency as CurrencyCode) || DEFAULT_CURRENCY,
      startDate,
      endDate,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
