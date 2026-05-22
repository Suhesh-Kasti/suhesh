import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import ArtPlayground from "@/components/ArtPlayground";

export const metadata: Metadata = {
  title: "CyberTools — Interactive Security Tools & Playground",
  description:
    "Interactive cybersecurity tools and playground: JWT debugger, XSS payload generator, MDX editor, and more. Hands-on security tools for developers and researchers.",
};

export default function ToolsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <ArtPlayground />
      </main>
      <SearchButton />
    </>
  );
}
