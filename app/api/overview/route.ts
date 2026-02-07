import { NextResponse } from "next/server";
import { getOverviewData } from "@/lib/overview";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getOverviewData();

  return NextResponse.json({
    total: data.total,
    topScore: data.topScore,
    results: data.results
      ? {
          ...data.results,
          lockedAt: data.results.lockedAt
            ? data.results.lockedAt.toISOString()
            : null
        }
      : null,
    submissions: data.submissions.map((submission) => ({
      ...submission,
      createdAt: submission.createdAt.toISOString()
    })),
    distributions: data.distributions
  });
}
