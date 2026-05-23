"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMDXComponents } from "@mdx-js/react";
import { mdxComponents } from "@/components/mdx";

interface Props {
  compiledSource: string;
}

export function MdxContent({ compiledSource }: Props) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = useMemo(() => {
    if (!mounted) return null;

    try {
      const scope = { Fragment, jsx, jsxs, useMDXComponents };
      const hydrateFn = Reflect.construct(
        Function as FunctionConstructor,
        ["scope", compiledSource]
      );
      const Content = hydrateFn.call(hydrateFn, scope).default;
      return <Content components={mdxComponents} />;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [compiledSource, mounted]);

  if (error) {
    return (
      <div className="font-mono text-sm text-red-500 border-2 border-red-500 p-4">
        Render error: {error}
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-fg-muted/10 rounded w-3/4" />
        <div className="h-4 bg-fg-muted/10 rounded w-1/2" />
        <div className="h-4 bg-fg-muted/10 rounded w-full" />
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
    ">
      {content}
    </div>
  );
}
