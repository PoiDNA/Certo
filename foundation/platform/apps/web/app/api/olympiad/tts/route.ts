import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * GET /api/olympiad/tts?text=...&lang=pl
 *
 * Text-to-Speech endpoint for survey questions.
 * Strategy: pre-generated MP3 URLs on CDN (Cloudflare R2).
 *
 * In production: returns redirect to R2 URL based on text hash.
 * In dev: returns a simple audio placeholder or uses Edge TTS.
 *
 * The CDN path convention:
 *   /tts/{lang}/{hash}.mp3
 *
 * Pre-generation script should create MP3s and upload to R2.
 * This endpoint serves as a resolver: text → CDN URL.
 */
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text");
  const lang = req.nextUrl.searchParams.get("lang") || "pl";

  if (!text) {
    return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
  }

  const hash = crypto.createHash("md5").update(`${lang}:${text}`).digest("hex").slice(0, 12);
  const cdnBase = process.env.TTS_CDN_BASE || "https://cdn.certogov.org/tts";
  const url = `${cdnBase}/${lang}/${hash}.mp3`;

  return NextResponse.json({
    url,
    hash,
    lang,
    text: text.slice(0, 100),
  });
}
