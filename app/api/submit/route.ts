import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { submissionSchema } from "@/lib/validation";
import { normalizeName } from "@/lib/normalize";
import { SUBMISSION_COOKIE } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const existingId = cookieStore.get(SUBMISSION_COOKIE)?.value;

  if (existingId) {
    const existing = await prisma.submission.findUnique({
      where: { id: existingId }
    });
    if (existing) {
      return NextResponse.json(
        { error: "Bereits von diesem Gerät abgegeben." },
        { status: 409 }
      );
    }
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (ip !== "unknown") {
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte kurz warten." },
        { status: 429 }
      );
    }
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const submissionId = crypto.randomUUID();
  const nameNormalized = normalizeName(parsed.data.name);

  try {
    await prisma.submission.create({
      data: {
        id: submissionId,
        name: parsed.data.name.trim(),
        nameNormalized,
        winner: parsed.data.winner,
        overUnder: parsed.data.overUnder,
        mvp: parsed.data.mvp,
        receiving: parsed.data.receiving,
        rushing: parsed.data.rushing,
        badBunny: parsed.data.badBunny,
        patriotsLove: parsed.data.patriotsLove
      }
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Name schon vergeben. Bitte anderen Namen wählen." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Speichern fehlgeschlagen." },
      { status: 500 }
    );
  }

  cookieStore.set({
    name: SUBMISSION_COOKIE,
    value: submissionId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  return NextResponse.json({ ok: true });
}
