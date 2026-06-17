import type { Metadata } from "next";
import AboutSection from "@/components/AboutSection";

export const metadata: Metadata = {
  title: "About — Application Security Engineer & Creative Coder",
  description:
    "Suhesh Kasti is an application security engineer and offensive security researcher. Learn about his background, expertise in web security, exploit development, malware analysis, and approach to creative problem-solving.",
};

export default function AboutPage() {
  return (
    <>
      <main className="flex-1 pt-16">
        <AboutSection />
      </main>
    </>
  );
}
