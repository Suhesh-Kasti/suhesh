import type { Metadata } from "next";
import { getToolMeta } from "@/lib/tool-metadata";
import { ToolStructuredData } from "@/components/ToolStructuredData";

const BASE_URL = "https://suhesh.com.np";
const slug = "hash-id";
const tool = getToolMeta(slug);

const url = BASE_URL + "/tools/" + slug;

export const metadata: Metadata = {
  title: tool?.title ?? "Security Tool",
  description: tool?.description,
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    title: tool?.title,
    description: tool?.description,
  },
  twitter: {
    card: "summary_large_image",
    title: tool?.title,
    description: tool?.description,
  },
  ...(tool?.noindex ? { robots: { index: false, follow: true } } : {}),
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolStructuredData slug={slug} />
      {children}
    </>
  );
}
