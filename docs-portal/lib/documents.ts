import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Supabase client (server-side)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Document types
export interface CertoDocument {
  id: string;
  slug: string;
  title: string;
  entity: "foundation" | "company";
  category: string;
  version: string;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "FROZEN";
  markdownPath: string;
  docxUrl?: string;
  pdfUrl?: string;
  lastReviewedAt?: string;
  reviewedBy?: string;
  content?: string;
  updatedAt: string;
}

// Read documents from filesystem (for SSG/ISR)
const REPO_ROOT = path.resolve(process.cwd(), "..");

const DOC_PATHS: Record<string, string> = {
  "normy-zewnetrzne": "foundation/governance/normy-zewnetrzne/README.md",
  "policy-registry": "foundation/governance/policy-registry/README.md",
  "deliverable-b": "company/technical/deliverable-b/README.md",
  "deliverable-c": "company/technical/deliverable-c/README.md",
  "statut": "foundation/frozen/statut/README.md",
  "metodologia": "foundation/governance/metodologia/README.md",
};

export function getDocumentSlugs(): string[] {
  return Object.keys(DOC_PATHS);
}

export function getDocument(slug: string): CertoDocument | null {
  const relativePath = DOC_PATHS[slug];
  if (!relativePath) return null;

  const fullPath = path.join(REPO_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data: frontmatter, content } = matter(raw);

  return {
    id: frontmatter.id || slug,
    slug,
    title: frontmatter.title || slug,
    entity: frontmatter.entity || "foundation",
    category: frontmatter.category || "governance",
    version: frontmatter.version || "1.0",
    status: frontmatter.status || "DRAFT",
    markdownPath: relativePath,
    docxUrl: frontmatter.docx_url,
    pdfUrl: frontmatter.pdf_url,
    lastReviewedAt: frontmatter.last_reviewed,
    reviewedBy: frontmatter.reviewed_by,
    content,
    updatedAt: frontmatter.last_modified || new Date().toISOString(),
  };
}

export function getAllDocuments(): CertoDocument[] {
  return getDocumentSlugs()
    .map(getDocument)
    .filter((d): d is CertoDocument => d !== null)
    .sort((a, b) => {
      // foundation first, then company
      if (a.entity !== b.entity) return a.entity === "foundation" ? -1 : 1;
      return a.title.localeCompare(b.title, "pl");
    });
}

// Entity labels
export const ENTITY_LABELS: Record<string, string> = {
  foundation: "Fundacja Certo",
  company: "Spółka Certo ID PSA",
};

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Szkic", color: "bg-yellow-100 text-yellow-800" },
  IN_REVIEW: { label: "W recenzji", color: "bg-blue-100 text-blue-800" },
  APPROVED: { label: "Zatwierdzony", color: "bg-green-100 text-green-800" },
  FROZEN: { label: "Zamrożony", color: "bg-gray-100 text-gray-800" },
};
