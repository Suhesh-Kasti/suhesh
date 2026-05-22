"use client";

import { ReactNode, HTMLAttributes, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck, faXmark, faExpand } from "@fortawesome/free-solid-svg-icons";

type ElProps = HTMLAttributes<HTMLElement> & { children?: ReactNode };
type CodeProps = HTMLAttributes<HTMLElement> & { children?: ReactNode; className?: string };

function isInlineCode(children: ReactNode): boolean {
  if (typeof children === "string") return !children.includes("\n");
  return true;
}

function CopyCode({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="font-mono text-2xs uppercase px-2 py-1 border border-fg-muted/40 text-fg-muted hover:text-fg hover:border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer whitespace-nowrap"
      style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em" }}
    >
      {copied ? <FontAwesomeIcon icon={faCheck} beatFade /> : <FontAwesomeIcon icon={faCopy} />}
    </button>
  );
}

export function BrutalBlockquote({ children, ...props }: ElProps) {
  return (
    <blockquote className="my-6 border-l-[6px] border-spider-pink pl-4 py-2 font-sans text-base italic" style={{ fontFamily: "var(--font-syne)" }} {...props}>
      {children}
    </blockquote>
  );
}

export function BrutalCode({ children, className, ...props }: CodeProps) {
  const inline = isInlineCode(children);
  if (inline) {
    return (
      <code
        className="font-mono text-sm border px-1.5 py-0.5"
        style={{ fontFamily: "var(--font-space-mono)", backgroundColor: "var(--surf-invert)", color: "var(--surf)", borderColor: "var(--fg-muted)" }}
        {...props}
      >
        {children}
      </code>
    );
  }
  return <code className={`block ${className ?? ""}`} style={{ fontFamily: "var(--font-space-mono)" }} {...props}>{children}</code>;
}

export function BrutalPre({ children, ...props }: ElProps) {
  const codeText = typeof children === "string" ? children : (children as any)?.props?.children ?? "";
  const textStr = typeof codeText === "string" ? codeText : "";

  return (
    <div className="my-6 border-2 border-fg shadow-brutal overflow-x-auto not-prose" style={{ backgroundColor: "var(--surf)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-fg" style={{ backgroundColor: "var(--fg)", color: "var(--surf)" }}>
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="w-3 h-3 border" style={{ borderColor: "var(--surf)", backgroundColor: "#ff1144" }} />
            <span className="w-3 h-3 border" style={{ borderColor: "var(--surf)", backgroundColor: "#ffdd00" }} />
            <span className="w-3 h-3 border" style={{ borderColor: "var(--surf)", backgroundColor: "#00dd44" }} />
          </span>
          <span className="font-mono text-2xs uppercase tracking-label ml-2" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}>code</span>
        </div>
        <CopyCode text={textStr} />
      </div>
      <pre className="font-mono text-sm leading-relaxed overflow-x-auto p-5 whitespace-pre" style={{ fontFamily: "var(--font-space-mono)", color: "var(--fg)", backgroundColor: "var(--surf)" }} {...props}>
        {children}
      </pre>
    </div>
  );
}

export function BrutalLink({ children, href, ...props }: ElProps & { href?: string }) {
  return (
    <a href={href} className="font-mono text-sm uppercase text-spider-blue hover:text-spider-pink underline decoration-2 underline-offset-2 transition-colors" style={{ fontFamily: "var(--font-space-mono)" }} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined} {...props}>
      {children} {href?.startsWith("http") ? "" : ""}
    </a>
  );
}

export function BrutalHr(props: ElProps) { return <hr className="my-8 border-0 h-[2px] bg-fg" {...props} />; }

export function BrutalTable({ children, ...props }: ElProps) {
  return <div className="my-6 overflow-x-auto not-prose"><table className="w-full border-collapse border-2 border-fg font-mono text-sm shadow-brutal" style={{ fontFamily: "var(--font-space-mono)" }} {...props}>{children}</table></div>;
}
export function BrutalTh({ children, ...props }: ElProps) {
  return <th className="border-2 border-fg bg-fg text-surface px-4 py-2 text-left font-bold uppercase text-xs" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }} {...props}>{children}</th>;
}
export function BrutalTd({ children, ...props }: ElProps) {
  return <td className="border-2 border-fg px-4 py-2" style={{ fontFamily: "var(--font-space-mono)" }} {...props}>{children}</td>;
}
export function BrutalUl({ children, ...props }: ElProps) {
  return <ul className="my-4 space-y-1 list-none" {...props}>{children}</ul>;
}
export function BrutalLi({ children, ...props }: ElProps) {
  return (
    <li className="flex items-start gap-2 font-sans text-base leading-relaxed pl-0" style={{ fontFamily: "var(--font-syne)" }} {...props}>
      <span className="text-spider-pink font-mono font-bold mt-[1px] shrink-0">&gt;</span>
      <span>{children}</span>
    </li>
  );
}
export function BrutalImg({ src, alt, ...props }: ElProps & { src?: string; alt?: string }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <figure className="my-6">
        <div
          className="border-2 border-fg shadow-brutal overflow-hidden not-prose cursor-pointer group relative"
          onClick={() => setFullscreen(true)}
          data-cursor-label="Expand Image"
        >
          <img src={src} alt={alt ?? ""} className="w-full object-cover" {...props} />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="font-mono text-2xs px-2 py-1 border border-fg bg-surface text-fg uppercase" style={{ fontFamily: "var(--font-space-mono)" }}>
              <FontAwesomeIcon icon={faExpand} className="mr-1" /> Expand
            </span>
          </div>
        </div>
        {alt && <figcaption className="mt-2 font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}>{alt}</figcaption>}
      </figure>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
            onClick={() => setFullscreen(false)}
          >
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-3 z-10">
              <span className="font-mono text-2xs uppercase tracking-label text-fg-muted" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}>
                {alt}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}
                className="font-mono text-2xs uppercase px-3 py-1 border border-fg-muted text-fg-muted hover:text-fg hover:border-fg transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <FontAwesomeIcon icon={faXmark} /> CLOSE
              </button>
            </div>
            <motion.img
              src={src}
              alt={alt ?? ""}
              className="max-w-[90vw] max-h-[85vh] object-contain border-2 border-fg shadow-brutal-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
