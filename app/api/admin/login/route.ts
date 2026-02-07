import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE } from "@/lib/constants";
import { getSessionExpiry } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: { password?: string } = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  if (payload.password !== "TB12") {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const expiresAt = getSessionExpiry();
  const session = await prisma.adminSession.create({
    data: {
      expiresAt
    }
  });

  cookies().set({
    name: ADMIN_COOKIE,
    value: session.id,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    path: "/"
  });

  return NextResponse.json({ ok: true });
}
