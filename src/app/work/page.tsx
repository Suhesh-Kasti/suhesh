import type { Metadata } from "next";
import Projects from "@/components/Projects";

const BASE_URL = "https://suhesh.com.np";

export const metadata: Metadata = {
  title: "Featured Work — Cybersecurity Projects & Research",
  description:
    "Projects and writing by Suhesh Kasti — a local AI security agent, browser automation, web experiments, and security writeups from his application security work.",
  alternates: { canonical: `${BASE_URL}/work` },
  openGraph: {
    title: "Featured Work — Cybersecurity Projects & Research",
    description:
      "Projects and writing by Suhesh Kasti — a local AI security agent, browser automation, web experiments, and security writeups from his application security work.",
    url: `${BASE_URL}/work`,
    siteName: "SCHIZO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Featured Work — Cybersecurity Projects & Research",
    description:
      "Projects and writing by Suhesh Kasti — a local AI security agent, browser automation, web experiments, and security writeups from his application security work.",
  },
};

export default function WorkPage() {
  return (
    <>
      <main className="flex-1 pt-16">
        <Projects />
      </main>
    </>
  );
}
