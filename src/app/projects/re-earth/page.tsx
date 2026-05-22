import type { Metadata } from "next";
import ProjectLayout from "@/components/ProjectLayout";
import ImageGallery from "@/components/ImageGallery";
import { COLORS } from "@/lib/design-tokens";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Re-Earth Waste Management — Web Design & Frontend",
  description:
    "Collaborative web project for Re-Earth waste management system in Nepal. Front page design and implementation for recycling categories, collection schedules, and impact metrics.",
};

export default function ReEarthPage() {
  return (
    <ProjectLayout title="Re-Earth Waste Management" category="Web Design" color={COLORS.teal}>
      <div className="border-2 border-fg p-4 mb-8 bg-surface">
        <Image src="/images/projects/re-earth.png" alt="Re-Earth Waste Management System" width={800} height={500} className="w-full h-auto" />
      </div>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">Project Description</h3>
      <p>A collaborative web project for Re-Earth, a waste management system based in Nepal. I was responsible for designing and implementing the front page layout, working alongside the project lead Ms. Anjila Tripathi to create an accessible and visually clear information architecture for the waste management platform.</p>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">My Role</h3>
      <p>I built the landing page with HTML, CSS, and JavaScript — focused on making the waste management workflow immediately understandable for users. The design needed to communicate recycling categories, collection schedules, and environmental impact metrics at a glance.</p>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">Key Features</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Clean, accessible front page design</li>
        <li>Waste category sections with clear visual hierarchy</li>
        <li>Collection schedule integration</li>
        <li>Impact metrics display</li>
        <li>Mobile-responsive layout</li>
      </ul>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">What I Learned</h3>
      <p>This was my first collaborative web project. I learned how to work with a designer/partner to translate requirements into code, how to structure a page for both information density and readability, and gained experience building websites for real-world use cases with actual users in mind.</p>

      <ImageGallery
        images={[
          { src: "/images/projects/re-earth.png", alt: "Re-Earth landing page design" },
        ]}
        color={COLORS.teal}
      />
    </ProjectLayout>
  );
}
