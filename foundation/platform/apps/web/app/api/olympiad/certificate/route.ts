import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/olympiad/certificate?org_name=...&level=gold&score=85&tenant=schools&locale=pl
 *
 * Generate a printable HTML certificate for Olimpiada Certo.
 * Levels: bronze (50-64), silver (65-79), gold (80-89), diament (90-100)
 *
 * Returns HTML ready to print via window.print()
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgName = searchParams.get("org_name") || "Organization";
  const level = searchParams.get("level") || "bronze";
  const score = searchParams.get("score") || "0";
  const tenant = searchParams.get("tenant") || "schools";
  const locale = searchParams.get("locale") || "pl";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const isPl = locale === "pl";

  const levelConfig: Record<string, { name: string; color: string; border: string; icon: string }> = {
    bronze: {
      name: "Certo Bronze",
      color: "#CD7F32",
      border: "#CD7F32",
      icon: "🥉",
    },
    silver: {
      name: "Certo Silver",
      color: "#C0C0C0",
      border: "#A8A8A8",
      icon: "🥈",
    },
    gold: {
      name: "Certo Gold",
      color: "#C49A3C",
      border: "#C49A3C",
      icon: "🥇",
    },
    diament: {
      name: "Diament Certo",
      color: "#1A2744",
      border: "#C49A3C",
      icon: "💎",
    },
  };

  const config = levelConfig[level] || levelConfig.bronze;

  const tenantNames: Record<string, Record<string, string>> = {
    schools: { pl: "Szkoły", en: "Schools" },
    culture: { pl: "Ośrodki Kultury", en: "Culture Centers" },
    "social-care": { pl: "DPS-y", en: "Social Care" },
    sports: { pl: "Ośrodki Sportowe", en: "Sports Centers" },
  };

  const tenantName = tenantNames[tenant]?.[locale] || tenant;

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <title>${config.name} — ${orgName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 landscape; margin: 0; }
    body { font-family: 'Georgia', 'Times New Roman', serif; }

    .no-print {
      text-align: center; padding: 16px; background: #1A2744; color: white;
    }
    .no-print button {
      background: #C49A3C; color: white; border: none; padding: 10px 28px;
      font-size: 15px; font-weight: bold; border-radius: 8px; cursor: pointer; margin: 0 6px;
    }
    @media print { .no-print { display: none; } }

    .certificate {
      width: 297mm; height: 210mm;
      margin: 0 auto;
      padding: 20mm;
      position: relative;
      background: linear-gradient(135deg, #FFFBF0 0%, #FFF8E7 50%, #FFFBF0 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center;
    }

    .border-frame {
      position: absolute; inset: 8mm;
      border: 3px solid ${config.border};
      border-radius: 4mm;
    }
    .border-frame::before {
      content: ''; position: absolute; inset: 3mm;
      border: 1px solid ${config.border}40;
      border-radius: 3mm;
    }

    .logo { font-size: 28pt; font-weight: 700; color: #1A2744; letter-spacing: 2px; margin-bottom: 4mm; }
    .subtitle { font-size: 11pt; color: #666; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 12mm; }

    .level-icon { font-size: 48pt; margin-bottom: 6mm; }
    .level-name { font-size: 24pt; color: ${config.color}; font-weight: 700; margin-bottom: 3mm; letter-spacing: 1px; }
    .score-text { font-size: 14pt; color: #666; margin-bottom: 10mm; }

    .org-name { font-size: 22pt; color: #1A2744; font-weight: 700; margin-bottom: 4mm; }
    .org-tenant { font-size: 11pt; color: #888; margin-bottom: 12mm; }

    .description {
      font-size: 11pt; color: #555; max-width: 500px; line-height: 1.6; margin-bottom: 12mm;
    }

    .footer { display: flex; justify-content: space-between; width: 80%; margin-top: auto; }
    .footer-item { text-align: center; }
    .footer-line { width: 50mm; border-top: 1px solid #999; margin: 0 auto 2mm; }
    .footer-label { font-size: 9pt; color: #888; }
    .footer-value { font-size: 10pt; color: #333; margin-bottom: 2mm; }

    .watermark {
      position: absolute; bottom: 12mm; right: 15mm;
      font-size: 8pt; color: #ccc; letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ ${isPl ? "Drukuj certyfikat" : "Print certificate"}</button>
    <button onclick="window.close()">✕ ${isPl ? "Zamknij" : "Close"}</button>
  </div>
  <div class="certificate">
    <div class="border-frame"></div>

    <div class="logo">Certo</div>
    <div class="subtitle">${isPl ? "Fundacja Certo Governance Institute" : "Certo Governance Institute Foundation"}</div>

    <div class="level-icon">${config.icon}</div>
    <div class="level-name">${config.name}</div>
    <div class="score-text">Certo Score: ${score}/100</div>

    <div class="org-name">${orgName}</div>
    <div class="org-tenant">Olimpiada Certo — ${tenantName}</div>

    <div class="description">
      ${isPl
        ? `Za osiągnięcie poziomu <strong>${config.name}</strong> w Olimpiadzie Certo, potwierdzające zaangażowanie w jakość zarządzania i transparentność działania.`
        : `For achieving <strong>${config.name}</strong> level in the Certo Olympiad, confirming commitment to governance quality and operational transparency.`
      }
    </div>

    <div class="footer">
      <div class="footer-item">
        <div class="footer-value">${date}</div>
        <div class="footer-line"></div>
        <div class="footer-label">${isPl ? "Data" : "Date"}</div>
      </div>
      <div class="footer-item">
        <div class="footer-value">${isPl ? "Patron Olimpiady Certo" : "Certo Olympiad Patron"}</div>
        <div class="footer-line"></div>
        <div class="footer-label">${isPl ? "Podpis" : "Signature"}</div>
      </div>
      <div class="footer-item">
        <div class="footer-value">CGI-${date.replace(/-/g, "")}-${score}</div>
        <div class="footer-line"></div>
        <div class="footer-label">${isPl ? "Numer certyfikatu" : "Certificate number"}</div>
      </div>
    </div>

    <div class="watermark">certogov.org/olympiad</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
