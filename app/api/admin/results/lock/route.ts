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

  const results = await prisma.result.findUnique({
    where: { id: RESULTS_ID }
  });

  if (!results) {
    return NextResponse.json(
      { error: "Erst Ergebnisse speichern." },
      { status: 400 }
    );
  }

  if (results.lockedAt) {
    return NextResponse.json({ ok: true, lockedAt: results.lockedAt });
  }

  const updated = await prisma.result.update({
    where: { id: RESULTS_ID },
    data: { lockedAt: new Date() }
  });

  return NextResponse.json({
    ok: true,
    lockedAt: updated.lockedAt?.toISOString() ?? null
  });
}
