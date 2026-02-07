import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { RESULTS_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.submission.deleteMany();
  await prisma.result.deleteMany({ where: { id: RESULTS_ID } });

  return NextResponse.json({ ok: true });
}
