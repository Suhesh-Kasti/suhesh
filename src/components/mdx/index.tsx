import { MDXComponents } from "mdx/types";
import type { HTMLAttributes } from "react";

function slugify(text: unknown): string {
  if (typeof text !== "string") return "";
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
import {
  BrutalBlockquote,
  BrutalCode,
  BrutalPre,
  BrutalLink,
  BrutalHr,
  BrutalTable,
  BrutalTh,
  BrutalTd,
  BrutalUl,
  BrutalLi,
  BrutalImg,
} from "./MarkdownComponents";
import InteractiveCode from "./InteractiveCode";
import BrutalButton from "./BrutalButton";
import IdeaNode from "./IdeaNode";
import Accordion from "./Accordion";
import Tabs from "./Tabs";
import CopyButton from "./CopyButton";
import ProgressChecklist from "./ProgressChecklist";
import QuizCard from "./QuizCard";
import FlipCard from "./FlipCard";
import Marquee from "./Marquee";
import GlitchBox from "./GlitchBox";
import DataBar from "./DataBar";
import ConceptExplorer from "./ConceptExplorer";
import CommandBuilder from "./CommandBuilder";
import Terminal from "./Terminal";
import Cloze from "./Cloze";
import SelfExplain from "./SelfExplain";
import Sequence from "./Sequence";
import MatchPairs from "./MatchPairs";
import Mermaid from "./Mermaid";

export const mdxComponents: MDXComponents = {
  // Standard markdown overrides
  blockquote: BrutalBlockquote,
  code: BrutalCode,
  pre: BrutalPre,
  a: BrutalLink,
  hr: BrutalHr,
  table: BrutalTable,
  th: BrutalTh,
  td: BrutalTd,
  ul: BrutalUl,
  li: BrutalLi,
  img: BrutalImg,

  // Headings
  h1: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="font-display text-4xl font-extrabold uppercase text-fg mt-12 mb-6 border-b-2 border-fg pb-2" style={{ fontFamily: "var(--font-clash-display)" }} {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(children);
    return <h2 id={id} className="font-display text-2xl font-bold uppercase text-fg mt-10 mb-4 scroll-mt-20" style={{ fontFamily: "var(--font-clash-display)" }} {...props}>{children}</h2>;
  },
  h3: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(children);
    return <h3 id={id} className="font-mono text-lg font-bold uppercase text-fg mt-8 mb-3 scroll-mt-20" style={{ fontFamily: "var(--font-space-mono)" }} {...props}>{children}</h3>;
  },
  h4: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="font-mono text-base font-bold uppercase text-fg-muted mt-6 mb-2" style={{ fontFamily: "var(--font-space-mono)" }} {...props}>{children}</h4>
  ),
  p: ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
    <p className="font-sans text-base leading-relaxed text-fg my-4 max-w-[68ch]" style={{ fontFamily: "var(--font-syne)" }} {...props}>{children}</p>
  ),
  strong: ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <strong className="font-extrabold uppercase text-fg" {...props}>{children}</strong>
  ),
  em: ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <em className="italic text-fg-muted" {...props}>{children}</em>
  ),

  // Interactive MDX components
  InteractiveCode: InteractiveCode,
  BrutalButton: BrutalButton,
  IdeaNode: IdeaNode,
  Accordion: Accordion,
  Tabs: Tabs,
  CopyButton: CopyButton,
  ProgressChecklist: ProgressChecklist,
  QuizCard: QuizCard,
  FlipCard: FlipCard,
  Marquee: Marquee,
  GlitchBox: GlitchBox,
  DataBar: DataBar,
  ConceptExplorer: ConceptExplorer,
  CommandBuilder: CommandBuilder,
  Terminal: Terminal,
  Cloze: Cloze,
  SelfExplain: SelfExplain,
  Sequence: Sequence,
  MatchPairs: MatchPairs,
  Mermaid: Mermaid,
};

export {
  InteractiveCode,
  BrutalButton,
  IdeaNode,
  Accordion,
  Tabs,
  CopyButton,
  ProgressChecklist,
  QuizCard,
  CommandBuilder,
  Terminal,
  Cloze,
  SelfExplain,
  Sequence,
  MatchPairs,
  Mermaid,
};
