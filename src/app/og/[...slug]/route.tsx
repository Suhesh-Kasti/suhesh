import { ImageResponse } from "next/og";
import { getAllSlugs, getPostBySlug } from "@/lib/braindump";
import { articleCard, homeCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/cards";

/**
 * Share cards for individual articles.
 *
 * This is a Route Handler rather than an `opengraph-image.tsx` file because the articles live
 * under a catch-all segment, and Next refuses a metadata image file after a catch-all
 * ("Catch-all must be the last part of the URL"). With `generateStaticParams` the card for
 * every article is still rendered once at build time, so nothing runs in the Worker.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const paths = getAllSlugs().map((slug) => {
    const parts = slug.split("/");
    // The .png suffix is for crawlers (WhatsApp among them) that refuse an image
    // URL without a recognisable extension.
    parts[parts.length - 1] = `${parts[parts.length - 1]}.png`;
    return { slug: parts };
  });
  return [{ slug: ["home.png"] }, ...paths];
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/").replace(/\.png$/, "");
  const post = getPostBySlug(path);

  if (path === "home") {
    return new ImageResponse(
      homeCard(),
      { ...OG_SIZE, headers: { "content-type": OG_CONTENT_TYPE, "cache-control": "public, max-age=31536000, immutable" } }
    );
  }


  return new ImageResponse(
    articleCard({
      title: post?.meta.title ?? "SCHIZO Brain Dump",
      type: post?.meta.type ?? "blog",
      category: post?.meta.category,
      tags: post?.meta.tags ?? [],
      date: post?.meta.date ?? "",
      excerpt: post?.meta.excerpt,
      readingTime: post?.meta.readingTime,
    }),
    { ...OG_SIZE, headers: { "content-type": OG_CONTENT_TYPE, "cache-control": "public, max-age=31536000, immutable" } }
  );
}
