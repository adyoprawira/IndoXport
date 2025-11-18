import { NextResponse } from "next/server";

// Simple simulated user endpoint for frontend development/demo.
export async function GET() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me/`);
    if (!res.ok) throw new Error("backend me failed");
    const json = await res.json();
    // normalize to { user }
    if (json.user) return NextResponse.json(json);
    if (json.profile) return NextResponse.json({ user: json.profile });
    return NextResponse.json({ user: json });
  } catch (err) {
    // fallback demo user
    const user = {
      id: 1,
      name: "Dwi Santoso",
      email: "dwi.santoso@example.com",
      company: "UD. SeaHarvest",
    };
    return NextResponse.json({ user });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = body?.user;
    if (!updated) return NextResponse.json({ message: "Missing user" }, { status: 400 });

    // In a real app you'd persist the updated user. Here we echo it back.
    return NextResponse.json({ user: updated });
  } catch (err) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
