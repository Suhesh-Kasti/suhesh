import type { Metadata } from "next";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Contact — Get in Touch with Suhesh Kasti",
  description:
    "Reach out to Suhesh Kasti for cybersecurity consulting, collaboration, speaking engagements, or just to talk security. Available via email, GitHub, Twitter, and LinkedIn.",
};

export default function ContactPage() {
  return (
    <>
      <main className="flex-1 pt-16">
        <ContactSection />
      </main>
    </>
  );
}
