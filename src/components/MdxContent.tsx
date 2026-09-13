import { MDX_CONTENT } from "@/generated/mdx-registry.mjs";
import { mdxComponents } from "@/components/mdx";
import SeriesRoadmap from "@/components/SeriesRoadmap";
import type { SeriesStep } from "@/lib/braindump";

interface Props {
  slug: string;
  steps?: SeriesStep[];
}

/**
 * Renders a pre-compiled MDX article. The MDX is compiled to a plain ESM module at
 * build time (see scripts/generate-content-registry.mjs) instead of being evaluated
 * in the browser, so it renders during static generation and needs no 'unsafe-eval'.
 *
 * When the post carries steps (a series or roadmap), a <ProgressChecklist /> component
 * becomes available to the body, so the article decides where the checklist sits
 * instead of the page template forcing it to the end.
 */
export function MdxContent({ slug, steps }: Props) {
  const Content = MDX_CONTENT[slug];
  const components = steps?.length
    ? { ...mdxComponents, ProgressChecklist: () => <SeriesRoadmap steps={steps} /> }
    : mdxComponents;

  if (!Content) {
    return (
      <div className="border-2 border-red-500 p-4 font-mono text-sm text-red-500">
        This article could not be rendered.
      </div>
    );
  }

  return (
    <div className="
      [&_table]:w-full [&_table]:border-collapse [&_table]:border-2 [&_table]:border-fg [&_table]:font-mono [&_table]:text-sm [&_table]:my-6 [&_table]:shadow-brutal
      [&_th]:border-2 [&_th]:border-fg [&_th]:bg-fg [&_th]:text-surface [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:uppercase [&_th]:text-xs
      [&_td]:border-2 [&_td]:border-fg [&_td]:px-4 [&_td]:py-2
      [&_thead]:border-b-2 [&_thead]:border-fg
      [&_tbody]:divide-y [&_tbody]:divide-fg-muted/20
        [&>*:last-child]:mb-0
    ">
        <Content components={components} />
    </div>
  );
}
