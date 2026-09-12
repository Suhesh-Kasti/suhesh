"use client";

import { Fragment, useEffect, useMemo, useState, type ComponentType } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMDXComponents } from "@mdx-js/react";
import type { MDXComponents } from "mdx/types";
import { mdxComponents } from "@/components/mdx";

interface Props {
  compiledSource: string;
}

export function MdxContent({ compiledSource }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compiling produces the component itself; rendering it happens outside this try/catch,
  // because React does not render synchronously inside one.
  const compiled = useMemo(() => {
    if (!mounted) return { Component: null, error: null };
    try {
      const scope = { Fragment, jsx, jsxs, useMDXComponents };
      const hydrateFn = Reflect.construct(
        Function as FunctionConstructor,
        ["scope", compiledSource]
      );
      const Content = hydrateFn.call(hydrateFn, scope).default as ComponentType<{ components?: MDXComponents }>;
      return { Component: Content, error: null };
    } catch (err) {
      return { Component: null, error: err instanceof Error ? err.message : "Could not compile this MDX." };
    }
  }, [compiledSource, mounted]);

  if (compiled.error) {
    return (
      <div className="font-mono text-sm text-red-500 border-2 border-red-500 p-4">
        Render error: {compiled.error}
      </div>
    );
  }

  if (!mounted || !compiled.Component) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-fg-muted/10 rounded w-3/4" />
        <div className="h-4 bg-fg-muted/10 rounded w-1/2" />
        <div className="h-4 bg-fg-muted/10 rounded w-full" />
      </div>
    );
  }

  const { Component } = compiled;

  return (
    <div className="
      [&_table]:w-full [&_table]:border-collapse [&_table]:border-2 [&_table]:border-fg [&_table]:font-mono [&_table]:text-sm [&_table]:my-6 [&_table]:shadow-brutal
      [&_th]:border-2 [&_th]:border-fg [&_th]:bg-fg [&_th]:text-surface [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:uppercase [&_th]:text-xs
      [&_td]:border-2 [&_td]:border-fg [&_td]:px-4 [&_td]:py-2
      [&_thead]:border-b-2 [&_thead]:border-fg
      [&_tbody]:divide-y [&_tbody]:divide-fg-muted/20
    ">
      <Component components={mdxComponents} />
    </div>
  );
}
