import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SUBMISSION_COOKIE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = cookies();
  const submissionId = cookieStore.get(SUBMISSION_COOKIE)?.value;
  if (!submissionId) {
    return NextResponse.json({ submission: null });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId }
  });

  if (!submission) {
    return NextResponse.json({ submission: null });
  }

  return NextResponse.json({
    submission: {
      id: submission.id,
      name: submission.name,
      winner: submission.winner,
      overUnder: submission.overUnder,
      mvp: submission.mvp,
      receiving: submission.receiving,
      rushing: submission.rushing,
      badBunny: submission.badBunny,
      patriotsLove: submission.patriotsLove,
      createdAt: submission.createdAt.toISOString()
    }
  });
}
