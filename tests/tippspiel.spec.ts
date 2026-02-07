import { test, expect } from "@playwright/test";
import ExcelJS from "exceljs";
import { promises as fs } from "node:fs";

const picks = {
  winner: "New England Patriots",
  overUnder: "Over 45.5",
  mvp: "Drake Maye (NE, QB)",
  receiving: "Jaxon Smith-Njigba (SEA)",
  rushing: "Kenneth Walker III (SEA)",
  badBunny: "Nein",
  patriotsLove: "Brady-Ära / Dynasty-Vibes"
};

async function adminReset(page) {
  await page.goto("/admin");
  await page.getByLabel("Admin Passwort").fill("TB12");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByTestId("admin-panel").waitFor();
  await page.request.post("/api/admin/reset");
}

async function createSubmission(page, name: string) {
  await page.goto("/");
  await page.getByLabel("Dein Name").fill(name);
  await page.getByLabel("Super Bowl Sieger").selectOption(picks.winner);
  await page.getByLabel("Over/Under").selectOption(picks.overUnder);
  await page.getByLabel("Super Bowl MVP").selectOption(picks.mvp);
  await page.getByLabel("Most Receiving Yards").selectOption(picks.receiving);
  await page.getByLabel("Most Rushing Yards").selectOption(picks.rushing);
  await page.getByLabel("Beleidigt Bad Bunny D.Trump in der Halbzeit").selectOption(picks.badBunny);
  await page.getByLabel("Warum ich die Patriots liebe").selectOption(picks.patriotsLove);
  await page.getByRole("button", { name: "Tipp absenden" }).click();
}

test("submit flow and overview shows entry", async ({ page }) => {
  await adminReset(page);
  await createSubmission(page, "Tester One");
  await expect(page.getByText("Deine Tipps (gesperrt)")).toBeVisible();
  await page.getByRole("tab", { name: "Gesamtübersicht" }).click();
  await expect(page.getByText("Tester One")).toBeVisible();
});

test("admin results update scoring", async ({ page }) => {
  await adminReset(page);
  await createSubmission(page, "Winner Two");

  await page.goto("/admin");
  await page.getByTestId("admin-panel").waitFor();

  await page.getByLabel("Super Bowl Sieger").selectOption(picks.winner);
  await page.getByLabel("Over/Under").selectOption(picks.overUnder);
  await page.getByLabel("Super Bowl MVP").selectOption(picks.mvp);
  await page.getByLabel("Most Receiving Yards").selectOption(picks.receiving);
  await page.getByLabel("Most Rushing Yards").selectOption(picks.rushing);
  await page.getByLabel("Beleidigt Bad Bunny D.Trump in der Halbzeit").selectOption(picks.badBunny);

  await page.getByRole("button", { name: "Ergebnisse speichern" }).click();

  await page.goto("/");
  await page.getByRole("tab", { name: "Gesamtübersicht" }).click();

  const row = page.locator("tr", { hasText: "Winner Two" });
  await expect(row).toContainText("6");
  await expect(row).toContainText("Leader");
});

test("excel export returns non-empty xlsx", async ({ page }) => {
  await adminReset(page);
  await createSubmission(page, "Export User");

  await page.goto("/admin");
  await page.getByTestId("admin-panel").waitFor();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Excel Export (.xlsx)" }).click()
  ]);

  const path = await download.path();
  expect(path).toBeTruthy();
  if (!path) return;

  const buffer = await fs.readFile(path);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  expect(workbook.worksheets[0]?.name).toBe("Tobis Superbowl Tippspiel");
  expect(workbook.worksheets[0]?.rowCount).toBeGreaterThan(1);
});
