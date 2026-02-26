import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const providedPassword = body?.password?.trim() ?? "";
    const configuredPassword = process.env.DASHBOARD_PASSWORD?.trim() || "admin123";

    if (!providedPassword || providedPassword !== configuredPassword) {
      return NextResponse.json({ ok: false, message: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: "dashboard_auth",
      value: "1",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
