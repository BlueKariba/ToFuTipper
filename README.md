# Tobis Superbowl Tippspiel

Patriots-themed Tippspiel für Super Bowl LX (60) – ein Link für alle, dauerhafte Speicherung, Admin-Features, Scoring, Excel Export.

## Features
- Ein-Link-Flow auf `/` mit 7 Tipps pro Teilnehmer
- Device-Lock via HttpOnly Cookie + Name-Unique-Check
- Gesamtübersicht mit Vergleichstabelle + Prozentverteilung
- Adminbereich `/admin` (Passwort **TB12**) mit Ergebnis-Eingabe, Scoring, Exporten und Datenverwaltung
- Dauerhafte Speicherung (SQLite lokal, Postgres in Produktion)
- Excel Export als echte `.xlsx`
- Patriots-Designsystem + WCAG-orientierte Kontraste

## Tech Stack
- Next.js (App Router) + TypeScript
- TailwindCSS (Patriots Theme)
- Prisma + SQLite (lokal), Postgres (Prod)
- Zod Validation
- Playwright Tests
- GitHub Actions CI

## Lokales Setup
1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. `.env` anlegen (siehe `.env.example`).
3. Datenbank migrieren:
   ```bash
   npm run prisma:migrate:dev
   ```
4. App starten:
   ```bash
   npm run dev
   ```

## Dauerhafte Speicherung (wichtig)
- Lokal wird **SQLite** verwendet (`DATABASE_URL="file:./prisma/dev.db"`).
- Die DB-Datei bleibt dauerhaft erhalten, auch nach Neustart.
- In Produktion wird **Postgres** verwendet (z.B. Vercel Postgres, Neon, Supabase).

### Prisma-Workflow (Local vs Prod)
Dieses Repo enthält zwei Prisma-Schemata:
- `prisma/schema.sqlite.prisma` (lokal)
- `prisma/schema.postgres.prisma` (Prod)

Das Script `scripts/prisma.mjs` wählt automatisch anhand von `DATABASE_URL` das passende Schema:
- `file:` → SQLite
- alles andere → Postgres

Wichtige Produktions-Commands:
```bash
npm run prisma:migrate:deploy
```

Quellen:
- Prisma production workflow: https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production
- Prisma deploy database changes: https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate
- Prisma Deploy to Vercel: https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel
- Vercel Next.js + Prisma Postgres: https://vercel.com/kb/guide/nextjs-prisma-postgres
- Vercel DB connections best practices: https://vercel.com/kb/guide/connection-pooling-with-functions

## Admin Zugriff
- URL: `/admin`
- Passwort: **TB12**
- Session Cookie ist HttpOnly und kurzlebig (default 8 Stunden)

Admin-Funktionen:
- Ergebnis-Eingabe (6 Kategorien)
- Scoring & Leader-Markierung
- Excel Export (.xlsx) + optional CSV
- Suche, Delete by Name, Delete by ID
- Reset All (löscht Tipps und Ergebnisse)

## Scoring
- 6 Kategorien werden gewertet (Sieger, Over/Under, MVP, Receiving, Rushing, Bad Bunny)
- Je Kategorie 1 Punkt, max. 6 Punkte
- Kategorie "Warum ich die Patriots liebe" ist **Fun** (0 Punkte)

## Tests
```bash
npm test
```
Enthält:
- Submit Flow
- Overview zeigt Eintrag
- Admin Login
- Result Entry → Scoring
- Excel Export (XLSX öffnet & enthält Daten)

## CI
GitHub Actions Workflow in `.github/workflows/ci.yml`:
- `npm install`
- `npm run lint`
- `npm test`
- `npm run build`

## Quellen
### Team Colors
- https://teamcolorcodes.com/new-england-patriots-color-codes/
- https://www.flagcolorcodes.com/new-england-patriots
- https://teampalettes.com/nfl

### Team Logos
- https://commons.wikimedia.org/wiki/File:NFL_New_England_Patriots.svg
- https://commons.wikimedia.org/wiki/File:NFL_Seattle_Seahawks.svg

### Depth Charts / Roster
- https://www.patriots.com/team/depth-chart
- https://www.seahawks.com/team/depth-chart
- https://www.espn.com/nfl/team/depth/_/name/sea
- https://www.ourlads.com/nfldepthcharts/depthchart/NE

### Accessibility
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://dequeuniversity.com/rules/axe/4.8/color-contrast

### Excel Export (XLSX)
- https://github.com/exceljs/exceljs/discussions/2396

## Fonts
- Teko (Headlines)
- Barlow (Body)

## Roster Notes
- Keine Ersetzungen vorgenommen. Falls ein Spielername nicht belegbar ist, bitte die Optionslisten anpassen und hier dokumentieren.

## Projektstruktur (Auszug)
```
app/
  admin/
  api/
  components/
  globals.css
  layout.tsx
  page.tsx
lib/
prisma/
scripts/
tests/
```
