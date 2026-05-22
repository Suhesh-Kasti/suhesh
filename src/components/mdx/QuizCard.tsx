"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizCardProps {
  title?: string;
  questions: QuizQuestion[];
  color?: string;
}

export default function QuizCard({
  title = "Quick Quiz",
  questions = [],
  color = COLORS.yellow,
}: QuizCardProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const safeQuestions = Array.isArray(questions) ? questions : [];
  const total = safeQuestions.length;

  const question = safeQuestions[currentQ];

  if (total === 0) return null;

  const handleSelect = useCallback(
    (index: number) => {
      if (revealed) return;
      setSelectedOption(index);
      setRevealed(true);
      if (index === question.correct) {
        setScore((s) => s + 1);
      }
    },
    [revealed, question]
  );

  const handleNext = useCallback(() => {
    if (currentQ + 1 < total) {
      setCurrentQ((c) => c + 1);
      setSelectedOption(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  }, [currentQ, total]);

  if (finished) {
    return (
      <div className="my-8 border-2 border-fg shadow-brutal not-prose p-6 bg-surface text-center">
        <div
          className="font-display text-3xl font-extrabold uppercase mb-2"
          style={{ fontFamily: TYPOGRAPHY.fontDisplay, color }}
        >
          {score === total ? "Perfect!" : score >= total / 2 ? "Not Bad" : "Keep Learning"}
        </div>
        <p className="font-mono text-sm text-fg-muted mb-4" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          {score} / {total} correct
        </p>
        <button
          onClick={() => {
            setCurrentQ(0);
            setSelectedOption(null);
            setRevealed(false);
            setScore(0);
            setFinished(false);
          }}
          className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-colors cursor-pointer"
          style={{
            fontFamily: TYPOGRAPHY.fontMono,
            letterSpacing: TYPOGRAPHY.tracking.mono,
          }}
          data-cursor-label="Retry"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-8 border-2 border-fg shadow-brutal not-prose">
      {/* Header */}
      <div className="border-b-2 border-fg px-4 py-2 bg-fg text-surface flex justify-between items-center">
        <span
          className="font-mono text-2xs uppercase tracking-label"
          style={{
            fontFamily: TYPOGRAPHY.fontMono,
            letterSpacing: TYPOGRAPHY.tracking.label,
          }}
        >
          {title}
        </span>
        <span
          className="font-mono text-xs"
          style={{ fontFamily: TYPOGRAPHY.fontMono }}
        >
          {currentQ + 1}/{total}
        </span>
      </div>

      {/* Question */}
      <div className="p-4">
        <p
          className="font-sans text-base font-bold text-fg mb-4"
          style={{ fontFamily: TYPOGRAPHY.fontSans }}
        >
          {question.question}
        </p>

        <div className="space-y-2">
          {question.options.map((option, index) => {
            let borderColor = "border-fg-muted";
            let bg = "";
            if (revealed) {
              if (index === question.correct) {
                borderColor = "border-brutal-green";
                bg = "bg-brutal-green/10";
              } else if (index === selectedOption) {
                borderColor = "border-brutal-red";
                bg = "bg-brutal-red/10";
              }
            } else if (index === selectedOption) {
              borderColor = "border-fg";
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={`w-full text-left font-mono text-sm px-3 py-2 border-2 ${borderColor} ${bg} transition-colors hover:border-fg cursor-pointer ${
                  revealed ? "cursor-default" : ""
                }`}
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
                data-cursor-label={
                  revealed
                    ? index === question.correct
                      ? "Correct"
                      : "Wrong"
                    : "Select"
                }
              >
                <span className="text-fg-muted mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
                {revealed && index === question.correct && (
                  <span className="ml-2 text-brutal-green">[+]</span>
                )}
                {revealed && index === selectedOption && index !== question.correct && (
                  <span className="ml-2 text-brutal-red">[-]</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-3 border-t border-fg-muted/30 overflow-hidden"
            >
              <p className="text-sm text-fg-muted leading-relaxed" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                {question.explanation}
              </p>
              <button
                onClick={handleNext}
                className="mt-3 font-mono text-xs uppercase px-4 py-1.5 border border-fg text-fg hover:bg-fg hover:text-surface transition-colors cursor-pointer"
                style={{
                  fontFamily: TYPOGRAPHY.fontMono,
                  letterSpacing: TYPOGRAPHY.tracking.mono,
                }}
                data-cursor-label="Next Question"
              >
                {currentQ + 1 < total ? "Next →" : "See Results"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
