"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface ImageGalleryProps {
  images: { src: string; alt: string; label?: string }[];
  color?: string;
}

export default function ImageGallery({ images, color }: ImageGalleryProps) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  const accent = color ?? "#ff2d95";

  return (
    <>
      <div className="mt-12 border-2 border-fg overflow-hidden not-prose">
        <div className="px-4 py-2 border-b-2 border-fg bg-fg text-surface flex items-center justify-between">
          <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
            Gallery
          </span>
          <span className="font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            {images.length} frames
          </span>
        </div>
        <div ref={scrollRef} className="flex overflow-x-auto gap-0 p-2" style={{ scrollSnapType: "x mandatory", backgroundColor: "var(--surf)" }}>
          {images.map((img, i) => (
            <motion.div
              key={i}
              className="shrink-0 border-2 border-fg-muted/30 hover:border-fg transition-colors cursor-pointer"
              style={{ scrollSnapAlign: "start", width: "280px" }}
              whileHover={{ y: -4, boxShadow: `6px 6px 0px ${accent}` }}
              onClick={() => setFullscreenIndex(i)}
              data-cursor-label="Expand"
            >
              <div className="aspect-video bg-fg/5 flex items-center justify-center overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="px-3 py-2 border-t border-fg-muted/30">
                <p className="font-mono text-2xs text-fg-muted uppercase truncate" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                  {img.alt}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen chaotic viewer */}
      <AnimatePresence>
        {fullscreenIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ backgroundColor: "var(--surf)" }}
            onClick={() => setFullscreenIndex(null)}
          >
            {/* Close bar */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-3 border-b-2 border-fg bg-fg text-surface z-10">
              <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                {images[fullscreenIndex].alt}
              </span>
              <button
                onClick={() => setFullscreenIndex(null)}
                className="font-mono text-2xs uppercase px-3 py-1 border border-surface hover:bg-surface hover:text-fg transition-colors cursor-pointer"
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
                data-cursor-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} shake /> CLOSE
              </button>
            </div>

            {/* Image */}
            <motion.div
              key={fullscreenIndex}
              initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.2, rotate: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-full max-w-4xl border-2 border-fg shadow-brutal-xl overflow-hidden m-4"
              style={{ backgroundColor: "var(--surf)" }}
            >
              <img
                src={images[fullscreenIndex].src}
                alt={images[fullscreenIndex].alt}
                className="w-full h-auto object-contain max-h-[70vh]"
              />
            </motion.div>

            {/* Chaotic decorative elements */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  width: 8 + Math.random() * 16,
                  height: 8 + Math.random() * 16,
                  border: `2px solid ${accent}`,
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  opacity: 0.6,
                }}
                animate={{
                  rotate: [0, 180, 360],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + Math.random() * 3,
                  delay: Math.random(),
                }}
              />
            ))}

            {/* Nav dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenIndex(i);
                  }}
                  className="w-3 h-3 border-2 border-fg cursor-pointer"
                  style={{ backgroundColor: i === fullscreenIndex ? accent : "transparent" }}
                  data-cursor-label={`Frame ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
