import { supabase } from "@/lib/documents";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("entity", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
