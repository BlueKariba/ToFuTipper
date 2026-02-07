import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(ADMIN_COOKIE)?.value;

  if (sessionId) {
    await prisma.adminSession.deleteMany({
      where: { id: sessionId }
    });
  }

  cookieStore.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });

  return NextResponse.json({ ok: true });
}
