import type { Metadata } from "next";
import ProjectLayout from "@/components/ProjectLayout";
import ImageGallery from "@/components/ImageGallery";
import { COLORS } from "@/lib/design-tokens";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Browser 11 — Windows 11 Desktop Replica in the Browser",
  description:
    "Complete Windows 11 desktop replica running in the browser. Interactive start menu, notification center, draggable window manager — built with vanilla HTML, CSS, and JavaScript.",
};

export default function Browser11Page() {
  return (
    <ProjectLayout title="Browser 11" category="Web Experiment" color={COLORS.blue}>
      <div className="border-2 border-fg p-4 mb-8 bg-surface">
        <Image src="/images/projects/jhyaleghara.png" alt="Browser 11 — Windows 11 replica in the browser" width={800} height={500} className="w-full h-auto" />
      </div>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">Project Description</h3>
      <p>One of my early web development projects — a complete Windows 11 desktop replica running entirely in a web browser. Built with vanilla HTML, CSS, and JavaScript, it features an interactive start button, notification center, taskbar, and window management — all faithfully mimicking the Windows 11 UI.</p>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">What I Built</h3>
      <p>A fully functional desktop environment emulation. The start menu opens and closes, notifications slide in, windows can be dragged and resized, and the taskbar shows running &quot;apps.&quot; All the interactivity is driven by pure JavaScript DOM manipulation — no frameworks, no libraries.</p>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">Key Features</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Interactive start button and start menu</li>
        <li>Functional notification center</li>
        <li>Draggable and resizable window manager</li>
        <li>Taskbar with active app indicators</li>
        <li>Windows 11-style design with dark/light theme</li>
      </ul>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">What I Learned</h3>
      <p>This was a crash course in UI state management, event handling, and DOM manipulation at scale. I learned how desktop window managers work under the hood, how to handle multiple overlapping interactive elements, and gained deep appreciation for what browser APIs can do without any framework.</p>

      <ImageGallery
        images={[
          { src: "/images/projects/jhyaleghara.png", alt: "Browser 11 Windows 11 replica in browser" },
        ]}
        color={COLORS.blue}
      />
    </ProjectLayout>
  );
}
