import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { normalizeName } from "@/lib/normalize";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { nameNormalized: { contains: normalizeName(q) } }
        ]
      }
    : undefined;

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    submissions: submissions.map((submission) => ({
      ...submission,
      createdAt: submission.createdAt.toISOString()
    }))
  });
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  const name = request.nextUrl.searchParams.get("name");

  if (!id && !name) {
    return NextResponse.json(
      { error: "Bitte id oder name angeben." },
      { status: 400 }
    );
  }

  if (id) {
    await prisma.submission.deleteMany({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (name) {
    const normalized = normalizeName(name);
    await prisma.submission.deleteMany({ where: { nameNormalized: normalized } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
