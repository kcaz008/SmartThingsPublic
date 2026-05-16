import { NextResponse } from "next/server";
import { scanVisiblePosts, type VisiblePostInput } from "@/lib/extension-scan";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const rawPosts: unknown[] = Array.isArray(body.posts) ? body.posts : [];
  const posts = rawPosts
    .map(normalizePostInput)
    .filter((post: VisiblePostInput | null): post is VisiblePostInput => {
      return post !== null;
    });

  if (posts.length === 0) {
    return NextResponse.json(
      { error: "posts must include visible post text from the current page" },
      { status: 400, headers: corsHeaders },
    );
  }

  const cards = await scanVisiblePosts({
    source_name: String(body.source_name ?? "Current Facebook group"),
    source_type: String(body.source_type ?? "facebook_group"),
    page_url: body.page_url ? String(body.page_url) : undefined,
    posts,
  });

  return NextResponse.json(
    {
      source_name: String(body.source_name ?? "Current Facebook group"),
      source_type: String(body.source_type ?? "facebook_group"),
      page_url: body.page_url ? String(body.page_url) : undefined,
      scanned_post_count: posts.length,
      opportunity_count: cards.length,
      cards,
      safety: {
        user_clicked_scan: true,
        visible_page_only: true,
        password_storage: false,
        background_scraping: false,
        automatic_posting: false,
      },
    },
    { headers: corsHeaders },
  );
}

function normalizePostInput(value: unknown): VisiblePostInput | null {
  if (typeof value === "string") {
    return { original_text: value.trim() };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const post = value as Record<string, unknown>;
  const originalText = String(
    post.original_text ?? post.originalText ?? post.text ?? "",
  ).trim();

  if (!originalText) {
    return null;
  }

  return {
    original_text: originalText,
    post_url: post.post_url ? String(post.post_url) : undefined,
    author_name: post.author_name ? String(post.author_name) : undefined,
  };
}
