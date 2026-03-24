import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

/**
 * POST /api/olympiad/qr-cards
 *
 * Generate a printable HTML page with unique QR cards (A4 layout).
 * Each card has a unique one-time link.
 *
 * Body: { tenant_id, group_id, cohort_name, count, base_url? }
 * Returns: HTML string (ready to print via window.print())
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenant_id,
      group_id,
      cohort_name,
      count = 30,
      base_url,
    } = body;

    if (!tenant_id || !group_id || !cohort_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cardCount = Math.min(Math.max(count, 1), 100);
    const origin = base_url || req.headers.get("origin") || "https://certogov.org";

    // Generate unique links and QR SVGs
    const cards: { hash: string; url: string; svg: string }[] = [];
    for (let i = 0; i < cardCount; i++) {
      const hash = generateHash();
      const url = `${origin}/pl/olympiad/${tenant_id}/survey?group=${group_id}&link=${hash}`;
      const svg = await QRCode.toString(url, {
        type: "svg",
        width: 120,
        margin: 1,
        color: { dark: "#1A2744", light: "#FFFFFF" },
      });
      cards.push({ hash, url, svg });
    }

    // Generate printable HTML
    const html = generatePrintableHTML(cards, cohort_name, tenant_id, group_id);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (e) {
    console.error("[QR Cards] Error:", e);
    return NextResponse.json(
      { error: "Failed to generate QR cards" },
      { status: 500 }
    );
  }
}

function generateHash(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let hash = "";
  for (let i = 0; i < 8; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function generatePrintableHTML(
  cards: { hash: string; url: string; svg: string }[],
  cohortName: string,
  tenantId: string,
  groupId: string
): string {
  const cardsPerPage = 10; // 2 columns × 5 rows on A4
  const pages: string[] = [];

  for (let i = 0; i < cards.length; i += cardsPerPage) {
    const pageCards = cards.slice(i, i + cardsPerPage);
    const cardHtml = pageCards
      .map(
        (card) => `
      <div class="card">
        <div class="qr">${card.svg}</div>
        <div class="info">
          <div class="title">Olimpiada Certo</div>
          <div class="cohort">${cohortName}</div>
          <div class="code">${card.hash}</div>
        </div>
      </div>`
      )
      .join("\n");

    pages.push(`<div class="page"><div class="grid">${cardHtml}</div></div>`);
  }

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <title>Karty QR — ${cohortName} — Olimpiada Certo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

    @media print {
      .no-print { display: none !important; }
      .page { page-break-after: always; }
      .page:last-child { page-break-after: avoid; }
    }

    .no-print {
      text-align: center;
      padding: 20px;
      background: #1A2744;
      color: white;
    }
    .no-print button {
      background: #C49A3C;
      color: white;
      border: none;
      padding: 12px 32px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      margin: 0 8px;
    }
    .no-print p {
      margin: 8px 0;
      font-size: 14px;
      opacity: 0.7;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 10mm;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4mm;
    }

    .card {
      border: 1px dashed #ccc;
      border-radius: 4mm;
      padding: 4mm;
      display: flex;
      align-items: center;
      gap: 3mm;
      height: 52mm;
    }

    .qr { flex-shrink: 0; width: 30mm; height: 30mm; }
    .qr svg { width: 100%; height: 100%; }

    .info { flex: 1; }
    .title { font-size: 10pt; font-weight: 700; color: #1A2744; }
    .cohort { font-size: 8pt; color: #666; margin: 1mm 0; }
    .code { font-size: 7pt; font-family: monospace; color: #999; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="no-print">
    <p>Olimpiada Certo — ${cohortName} — ${cards.length} kart QR</p>
    <button onclick="window.print()">🖨️ Drukuj karty</button>
    <button onclick="window.close()">✕ Zamknij</button>
    <p>Wytnij po przerywanych liniach i rozdaj na wywiadówce</p>
  </div>
  ${pages.join("\n")}
</body>
</html>`;
}
