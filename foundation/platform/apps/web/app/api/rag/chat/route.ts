import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateResponse, type ChatMessage, type ModelChoice } from "@/lib/rag/generate";

// Rate limiter: 10 requests per minute per IP
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: {
    message: string;
    conversationHistory?: ChatMessage[];
    filters?: {
      sectors?: string[];
      sourceTypes?: string[];
    };
    model?: ModelChoice;
    thinking?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string") {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 }
    );
  }

  if (body.message.length > 4000) {
    return NextResponse.json(
      { error: "Message too long (max 4000 chars)" },
      { status: 400 }
    );
  }

  // Validate model choice
  const model: ModelChoice = body.model === "opus" ? "opus" : "sonnet";
  const thinking = body.thinking !== false; // default true

  try {
    const { stream, sources } = await generateResponse({
      query: body.message,
      conversationHistory: body.conversationHistory,
      filters: body.filters,
      model,
      thinking,
    });

    // Create SSE stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send sources metadata first
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "sources", sources: sources.map((s) => ({ id: s.id, docTitle: s.docTitle, heading: (s.metadata as { heading?: string }).heading, docSourceType: s.docSourceType, score: s.score })) })}\n\n`
            )
          );

          // Stream text + thinking chunks
          for await (const event of stream) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: event.type, text: event.content })}\n\n`
              )
            );
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: err instanceof Error ? err.message : "Unknown error" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("RAG chat error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
