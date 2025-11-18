import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body || {};

    // Simulated password check. In real app, validate against auth backend.
    const CORRECT_CURRENT = "oldpass";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    if (currentPassword !== CORRECT_CURRENT) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
    }

    // Simulate password change success
    return NextResponse.json({ message: "Password changed" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
