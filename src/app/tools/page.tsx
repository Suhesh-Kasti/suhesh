import type { Metadata } from "next";
import ArtPlayground from "@/components/ArtPlayground";
import { ItemListStructuredData } from "@/components/ItemListStructuredData";
import { INDEXABLE_TOOL_META } from "@/lib/tool-metadata";

const BASE_URL = "https://suhesh.com.np";

const TOOLS_TITLE = "Security Tools — Free Browser-Based Pentest Utilities";
const TOOLS_DESCRIPTION =
  "Free, browser-based security tools: payload arsenal, JWT and X.509 certificate inspectors, HTTP security header analyzer, hash identifier, hex dump analyzer, nmap parser, regex lab, reverse shell generator and a reconnaissance suite. Everything runs locally in your browser.";

export const metadata: Metadata = {
  title: TOOLS_TITLE,
  description: TOOLS_DESCRIPTION,
  alternates: { canonical: `${BASE_URL}/tools` },
  openGraph: {
    title: TOOLS_TITLE,
    description: TOOLS_DESCRIPTION,
    url: `${BASE_URL}/tools`,
    siteName: "SCHIZO",
  },
  twitter: {
    card: "summary_large_image",
    title: TOOLS_TITLE,
    description: TOOLS_DESCRIPTION,
  },
};

export default function ToolsPage() {
  return (
    <>
      <ItemListStructuredData
        name="Security Tools"
        description={TOOLS_DESCRIPTION}
        path="/tools"
        items={INDEXABLE_TOOL_META.map((tool) => ({ name: tool.name, url: `/tools/${tool.slug}` }))}
      />
      <main className="flex-1 pt-16">
        <ArtPlayground />
      </main>
    </>
  );
}
