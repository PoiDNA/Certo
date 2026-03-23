import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/rag/supabase";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, Header, Footer, PageNumber,
} from "docx";

async function getAuthUser() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

/**
 * POST /api/rag/export — Export conversation to DOCX
 * Body: { conversationId: string } or { messages: Message[] }
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    conversationId?: string;
    messages?: Array<{ role: string; content: string; thinking?: string }>;
    title?: string;
  };

  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let messages: Array<{ role: string; content: string; thinking?: string }> = [];
  let title = body.title || "Analiza metodologiczna Certo";

  // Load from conversation if ID provided
  if (body.conversationId) {
    const sb = getServiceSupabase();
    const { data: conv } = await sb
      .from("rag_conversations")
      .select("title")
      .eq("id", body.conversationId)
      .eq("user_id", user.id)
      .single();

    if (conv) title = (conv as { title?: string }).title || title;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: msgs } = await (sb.from("rag_messages") as any)
      .select("role, content, thinking")
      .eq("conversation_id", body.conversationId)
      .order("created_at", { ascending: true });

    messages = msgs || [];
  } else if (body.messages) {
    messages = body.messages;
  } else {
    return NextResponse.json({ error: "conversationId or messages required" }, { status: 400 });
  }

  // Build DOCX
  const doc = buildDocument(title, messages);
  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new Response(uint8, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="certo-analiza-${Date.now()}.docx"`,
    },
  });
}

function buildDocument(
  title: string,
  messages: Array<{ role: string; content: string; thinking?: string }>
): Document {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 32, font: "DM Sans" })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Metadata
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Certo Governance Institute — Analiza metodologiczna`,
          italics: true, size: 20, color: "666666", font: "DM Sans",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Data: ${new Date().toLocaleDateString("pl-PL")} | Model: Claude`,
          size: 18, color: "999999", font: "DM Sans",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Separator
  children.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
    spacing: { after: 300 },
  }));

  // Messages
  for (const msg of messages) {
    const isUser = msg.role === "user";

    // Role label
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: isUser ? "PYTANIE:" : "ODPOWIEDŹ AGENTA:",
            bold: true,
            size: 20,
            color: isUser ? "0A1628" : "B8860B",
            font: "DM Sans",
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );

    // Content — parse markdown-like content into paragraphs
    const contentLines = msg.content.split("\n");
    for (const line of contentLines) {
      if (!line.trim()) continue;

      // Detect headings
      const h2Match = line.match(/^##\s+(.+)/);
      const h3Match = line.match(/^###\s+(.+)/);
      const bulletMatch = line.match(/^[-•*]\s+(.+)/);
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);

      if (h2Match) {
        children.push(new Paragraph({
          children: [new TextRun({ text: h2Match[1], bold: true, size: 24, font: "DM Sans" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }));
      } else if (h3Match) {
        children.push(new Paragraph({
          children: [new TextRun({ text: h3Match[1], bold: true, size: 22, font: "DM Sans" })],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 150, after: 80 },
        }));
      } else if (bulletMatch) {
        children.push(new Paragraph({
          children: [parseInlineFormatting(bulletMatch[1])].flat(),
          bullet: { level: 0 },
          spacing: { after: 40 },
        }));
      } else if (numberedMatch) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${numberedMatch[1]}. `, bold: true, size: 20, font: "DM Sans" }),
            ...parseInlineFormatting(numberedMatch[2]),
          ],
          spacing: { after: 40 },
        }));
      } else {
        children.push(new Paragraph({
          children: parseInlineFormatting(line),
          spacing: { after: 60 },
        }));
      }
    }

    // Separator between exchanges
    children.push(new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" } },
      spacing: { after: 200 },
    }));
  }

  // Footer disclaimer
  children.push(new Paragraph({
    children: [
      new TextRun({
        text: "Dokument wygenerowany przez Certo Methodology Agent. Odpowiedzi oparte na bazie wiedzy Certo. Wymaga weryfikacji przez Kolegium Standardu.",
        italics: true, size: 16, color: "999999", font: "DM Sans",
      }),
    ],
    spacing: { before: 400 },
  }));

  return new Document({
    creator: "Certo Governance Institute",
    title,
    description: "Analiza metodologiczna wygenerowana przez Certo RAG Agent",
    sections: [{
      properties: {},
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: "Certo Governance Institute — Dokument roboczy", size: 16, color: "BBBBBB", font: "DM Sans" })],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: "Strona ", size: 16, color: "BBBBBB" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "BBBBBB" }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  });
}

/**
 * Parse inline bold/italic markdown into TextRun array
 */
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\])/g);

  for (const part of parts) {
    if (!part) continue;

    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
    const italicMatch = part.match(/^\*(.+)\*$/);
    const citationMatch = part.match(/^\[(\d+)\]$/);

    if (boldMatch) {
      runs.push(new TextRun({ text: boldMatch[1], bold: true, size: 20, font: "DM Sans" }));
    } else if (italicMatch) {
      runs.push(new TextRun({ text: italicMatch[1], italics: true, size: 20, font: "DM Sans" }));
    } else if (citationMatch) {
      runs.push(new TextRun({
        text: `[${citationMatch[1]}]`,
        bold: true, size: 18, color: "B8860B",
        font: "DM Sans",
      }));
    } else {
      runs.push(new TextRun({ text: part, size: 20, font: "DM Sans" }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, size: 20, font: "DM Sans" })];
}
