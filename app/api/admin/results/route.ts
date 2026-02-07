import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { RESULTS_ID } from "@/lib/constants";
import { resultsSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await prisma.result.findUnique({
    where: { id: RESULTS_ID }
  });

  if (!results) {
    return NextResponse.json({ results: null });
  }

  return NextResponse.json({
    results: {
      ...results,
      createdAt: results.createdAt.toISOString(),
      updatedAt: results.updatedAt.toISOString(),
      lockedAt: results.lockedAt ? results.lockedAt.toISOString() : null
    }
  });
}

export async function PUT(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.result.findUnique({
    where: { id: RESULTS_ID }
  });

  if (existing?.lockedAt) {
    return NextResponse.json(
      { error: "Ergebnisse sind gesperrt." },
      { status: 409 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const parsed = resultsSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const results = await prisma.result.upsert({
    where: { id: RESULTS_ID },
    update: {
      winner: parsed.data.winner,
      overUnder: parsed.data.overUnder,
      mvp: parsed.data.mvp,
      receiving: parsed.data.receiving,
      rushing: parsed.data.rushing,
      badBunny: parsed.data.badBunny
    },
    create: {
      id: RESULTS_ID,
      winner: parsed.data.winner,
      overUnder: parsed.data.overUnder,
      mvp: parsed.data.mvp,
      receiving: parsed.data.receiving,
      rushing: parsed.data.rushing,
      badBunny: parsed.data.badBunny
    }
  });

  return NextResponse.json({
    results: {
      ...results,
      createdAt: results.createdAt.toISOString(),
      updatedAt: results.updatedAt.toISOString(),
      lockedAt: results.lockedAt ? results.lockedAt.toISOString() : null
    }
  });
}
