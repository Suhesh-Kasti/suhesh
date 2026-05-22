"use client";

import { useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";

type EncodeMode = "url" | "hex" | "html" | "rot13" | "unicode";

export default function EncoderTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<EncodeMode>("url");

  const handleEncode = useCallback(() => {
    try {
      switch (mode) {
        case "url": setOutput(encodeURIComponent(input)); break;
        case "hex":
          setOutput(Array.from(new TextEncoder().encode(input)).map(b => "%" + b.toString(16).padStart(2, "0").toUpperCase()).join(""));
          break;
        case "html":
          setOutput(input.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c)));
          break;
        case "rot13":
          setOutput(input.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < "n" ? 13 : -13))));
          break;
        case "unicode":
          setOutput(Array.from(input).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`).join(""));
          break;
      }
    } catch { setOutput("Encoding failed"); }
  }, [input, mode]);

  const handleDecode = useCallback(() => {
    try {
      switch (mode) {
        case "url": setOutput(decodeURIComponent(input)); break;
        case "hex":
          const hex = input.replace(/%/g, "");
          setOutput(new TextDecoder().decode(new Uint8Array(hex.match(/.{2}/g)?.map(b => parseInt(b, 16)) ?? [])));
          break;
        case "html":
          const ta = document.createElement("textarea");
          ta.innerHTML = input;
          setOutput(ta.value);
          break;
        case "rot13": handleEncode(); break;
        default: setOutput("Decode not available for this mode");
      }
    } catch { setOutput("Decoding failed — invalid input"); }
  }, [input, mode]);

  const modes: EncodeMode[] = ["url", "hex", "html", "rot13", "unicode"];

  return (
    <div className="border-2 border-fg shadow-brutal bg-surface">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-fg bg-fg text-surface">
        <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>encoder / decoder</span>
        <span className="font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{mode.toUpperCase()}</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-1.5 flex-wrap">
          {modes.map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`font-mono text-2xs uppercase px-2.5 py-1 border cursor-pointer transition-all ${mode === m ? "border-fg bg-fg text-surface" : "border-fg-muted/30 text-fg-muted hover:border-fg"}`} style={{ fontFamily: TYPOGRAPHY.fontMono }}>{m}</button>
          ))}
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={`${mode.toUpperCase()} encode/decode input...`} className="w-full bg-transparent border-2 border-fg font-mono text-sm p-3 min-h-[80px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }} rows={3} />
        <div className="flex gap-2">
          <button onClick={handleEncode} className="font-mono text-2xs uppercase px-4 py-1.5 border border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Encode</button>
          <button onClick={handleDecode} className="font-mono text-2xs uppercase px-4 py-1.5 border border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Decode</button>
        </div>
        <AnimatePresence>
          {output && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border-2 border-brutal-green p-3 bg-brutal-green/5">
              <pre className="font-mono text-sm whitespace-pre-wrap break-all" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>{output}</pre>
              <button onClick={() => navigator.clipboard.writeText(output)} className="mt-2 font-mono text-2xs uppercase text-fg-muted hover:text-fg cursor-pointer border border-fg-muted px-2 py-0.5 hover:border-fg transition-all flex items-center gap-1" style={{ fontFamily: TYPOGRAPHY.fontMono }}><FontAwesomeIcon icon={faCopy} /> COPY</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
