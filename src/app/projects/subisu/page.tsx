import type { Metadata } from "next";
import ProjectLayout from "@/components/ProjectLayout";
import ImageGallery from "@/components/ImageGallery";
import { COLORS } from "@/lib/design-tokens";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Subisu TSC Desktop App — ISP Training Application",
  description:
    "Python/Tkinter desktop application for Subisu ISP training: interactive networking modules, quiz engine, offline-first learning, and progress tracking for new technical recruits.",
};

export default function SubisuPage() {
  return (
    <ProjectLayout title="Subisu TSC Desktop App" category="Desktop App" color={COLORS.purple}>
      <div className="border-2 border-fg p-4 mb-8 bg-surface">
        <Image src="/images/projects/subisuTSC.jpg" alt="Subisu TSC Desktop Training App" width={800} height={500} className="w-full h-auto" />
      </div>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">Project Description</h3>
      <p>A Python desktop application built for Subisu TSC (Technical Service Center) to train new recruits. The app provides an interactive, self-paced learning environment covering networking fundamentals, cable types, IP addressing, troubleshooting procedures, and internal tools used at Subisu.</p>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">What I Built</h3>
      <p>Built with Python and Tkinter for the GUI, the app includes multiple learning modules with quizzes, progress tracking, and a knowledge test at the end. Trainees could complete modules in order, revisit topics, and see their scores — all without needing an internet connection.</p>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">Key Features</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Interactive learning modules with image-based diagrams</li>
        <li>Quiz engine with randomized questions and scoring</li>
        <li>Progress tracking across sessions</li>
        <li>Offline-first — no internet required for training</li>
        <li>Custom Tkinter-based responsive UI</li>
      </ul>
      <h3 className="font-display text-lg font-extrabold uppercase mt-8 mb-4">What I Learned</h3>
      <p>This project taught me GUI development with Tkinter, state management across application sessions, quiz/question bank design patterns, and building software that non-technical staff could use without training. It also gave me real-world experience working with an ISP&apos;s internal training requirements.</p>

      <ImageGallery
        images={[
          { src: "/images/projects/subisuTSC.jpg", alt: "Subisu TSC Desktop App training interface" },
        ]}
        color={COLORS.purple}
      />
    </ProjectLayout>
  );
}
