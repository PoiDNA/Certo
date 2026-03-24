import crypto from "crypto";

/**
 * TTS utilities for Olimpiada Certo.
 *
 * Strategy: pre-generated MP3 files on Cloudflare R2 CDN.
 * Each question text gets a deterministic hash → CDN path.
 *
 * CDN convention: {TTS_CDN_BASE}/{lang}/{hash}.mp3
 * Example: https://cdn.certogov.org/tts/pl/a1b2c3d4e5f6.mp3
 */

const CDN_BASE = process.env.TTS_CDN_BASE || "https://cdn.certogov.org/tts";

/**
 * Generate deterministic audio URL for a question text.
 */
export function getAudioUrl(text: string, lang: string): string {
  const hash = crypto
    .createHash("md5")
    .update(`${lang}:${text}`)
    .digest("hex")
    .slice(0, 12);
  return `${CDN_BASE}/${lang}/${hash}.mp3`;
}

/**
 * Generate audio URLs for all questions in a tenant config.
 * Returns a map: questionText → audioUrl
 */
export function generateAudioManifest(
  questions: { text: Record<string, string>; pillar: string }[],
  languages: string[]
): Record<string, Record<string, string>> {
  const manifest: Record<string, Record<string, string>> = {};

  for (const q of questions) {
    for (const lang of languages) {
      const text = q.text[lang];
      if (!text) continue;
      if (!manifest[lang]) manifest[lang] = {};
      manifest[lang][text] = getAudioUrl(text, lang);
    }
  }

  return manifest;
}

/**
 * Script helper: generate list of texts that need TTS MP3 files.
 * Use in a pre-generation script to create MP3s via Edge TTS or similar.
 */
export function getTTSManifestForUpload(
  questions: { text: Record<string, string>; pillar: string }[],
  languages: string[]
): { text: string; lang: string; hash: string; path: string }[] {
  const items: { text: string; lang: string; hash: string; path: string }[] = [];

  for (const q of questions) {
    for (const lang of languages) {
      const text = q.text[lang];
      if (!text) continue;
      const hash = crypto
        .createHash("md5")
        .update(`${lang}:${text}`)
        .digest("hex")
        .slice(0, 12);
      items.push({
        text,
        lang,
        hash,
        path: `${lang}/${hash}.mp3`,
      });
    }
  }

  return items;
}
