import { MDXComponents } from "mdx/types";

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

export const mdxComponents: MDXComponents = {
  // Standard markdown overrides
  blockquote: BrutalBlockquote as any,
  code: BrutalCode as any,
  pre: BrutalPre as any,
  a: BrutalLink as any,
  hr: BrutalHr as any,
  table: BrutalTable as any,
  th: BrutalTh as any,
  td: BrutalTd as any,
  ul: BrutalUl as any,
  li: BrutalLi as any,
  img: BrutalImg as any,

  // Headings
  h1: ({ children, ...props }: any) => (
    <h1 className="font-display text-4xl font-extrabold uppercase text-fg mt-12 mb-6 border-b-2 border-fg pb-2" style={{ fontFamily: "var(--font-clash-display)" }} {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: any) => {
    const id = slugify(children);
    return <h2 id={id} className="font-display text-2xl font-bold uppercase text-fg mt-10 mb-4 scroll-mt-20" style={{ fontFamily: "var(--font-clash-display)" }} {...props}>{children}</h2>;
  },
  h3: ({ children, ...props }: any) => {
    const id = slugify(children);
    return <h3 id={id} className="font-mono text-lg font-bold uppercase text-fg mt-8 mb-3 scroll-mt-20" style={{ fontFamily: "var(--font-space-mono)" }} {...props}>{children}</h3>;
  },
  h4: ({ children, ...props }: any) => (
    <h4 className="font-mono text-base font-bold uppercase text-fg-muted mt-6 mb-2" style={{ fontFamily: "var(--font-space-mono)" }} {...props}>{children}</h4>
  ),
  p: ({ children, ...props }: any) => (
    <p className="font-sans text-base leading-relaxed text-fg my-4 max-w-[68ch]" style={{ fontFamily: "var(--font-syne)" }} {...props}>{children}</p>
  ),
  strong: ({ children, ...props }: any) => (
    <strong className="font-extrabold uppercase text-fg" {...props}>{children}</strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic text-fg-muted" {...props}>{children}</em>
  ),

  // Interactive MDX components
  InteractiveCode: InteractiveCode as any,
  BrutalButton: BrutalButton as any,
  IdeaNode: IdeaNode as any,
  Accordion: Accordion as any,
  Tabs: Tabs as any,
  CopyButton: CopyButton as any,
  ProgressChecklist: ProgressChecklist as any,
  QuizCard: QuizCard as any,
  FlipCard: FlipCard as any,
  Marquee: Marquee as any,
  GlitchBox: GlitchBox as any,
  DataBar: DataBar as any,
  ConceptExplorer: ConceptExplorer as any,
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
};
