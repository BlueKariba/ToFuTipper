import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { RESULTS_ID, PROJECT_TITLE } from "@/lib/constants";
import { scoreSubmission } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "asc" }
  });

  const results = await prisma.result.findUnique({
    where: { id: RESULTS_ID }
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(PROJECT_TITLE);

  sheet.columns = [
    { header: "Timestamp", key: "timestamp", width: 24 },
    { header: "Name", key: "name", width: 22 },
    { header: "Sieger", key: "winner", width: 24 },
    { header: "Over/Under", key: "overUnder", width: 16 },
    { header: "MVP", key: "mvp", width: 28 },
    { header: "Most Receiving Yards", key: "receiving", width: 28 },
    { header: "Most Rushing Yards", key: "rushing", width: 26 },
    { header: "Bad Bunny beleidigt?", key: "badBunny", width: 22 },
    { header: "Warum ich die Patriots liebe", key: "patriotsLove", width: 36 },
    { header: "Punkte", key: "score", width: 10 }
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = {
    from: "A1",
    to: "J1"
  };

  const scoringResults =
    results &&
    results.winner &&
    results.overUnder &&
    results.mvp &&
    results.receiving &&
    results.rushing &&
    results.badBunny
      ? {
          winner: results.winner,
          overUnder: results.overUnder,
          mvp: results.mvp,
          receiving: results.receiving,
          rushing: results.rushing,
          badBunny: results.badBunny
        }
      : null;

  submissions.forEach((submission) => {
    const score = scoringResults
      ? scoreSubmission(submission, scoringResults).total
      : "";

    sheet.addRow({
      timestamp: submission.createdAt.toISOString(),
      name: submission.name,
      winner: submission.winner,
      overUnder: submission.overUnder,
      mvp: submission.mvp,
      receiving: submission.receiving,
      rushing: submission.rushing,
      badBunny: submission.badBunny,
      patriotsLove: submission.patriotsLove,
      score
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="tobis-superbowl-tippspiel.xlsx"'
    }
  });
}
