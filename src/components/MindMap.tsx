"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import type { BrainDumpMeta, ContentType } from "@/lib/braindump";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
  faBook,
  faLightbulb,
  faClipboardCheck,
  faFileCode,
  faBrain,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";

interface MindMapProps {
  posts: BrainDumpMeta[];
}

type MapNode = {
  id: string;
  label: string;
  icon: typeof faBook;
  color: string;
  parentId: string | null;
  children: MapNode[];
  slug?: string;
  excerpt?: string;
};

const TYPE_CONFIG: Record<ContentType, { label: string; icon: typeof faBook; color: string }> = {
  blog: { label: "Blog Posts", icon: faBook, color: COLORS.pink },
  til: { label: "Today I Learned", icon: faLightbulb, color: COLORS.yellow },
  cheatsheet: { label: "Cheatsheets", icon: faFileCode, color: COLORS.green },
  checklist: { label: "Checklists", icon: faClipboardCheck, color: COLORS.blue },
  braindump: { label: "Brain Dump", icon: faBrain, color: COLORS.purple },
};

function buildMap(posts: BrainDumpMeta[]): MapNode[] {
  const nodes: MapNode[] = [];
  for (const [type, cfg] of Object.entries(TYPE_CONFIG)) {
    const typePosts = posts.filter((p) => p.type === type);
    if (typePosts.length === 0) continue;
    const typeNode: MapNode = {
      id: `type-${type}`,
      label: cfg.label,
      icon: cfg.icon,
      color: cfg.color,
      parentId: null,
      children: [],
    };
    const categories: Record<string, BrainDumpMeta[]> = {};
    for (const post of typePosts) {
      const cat = post.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(post);
    }
    for (const [cat, catPosts] of Object.entries(categories)) {
      const catNode: MapNode = {
        id: `cat-${type}-${cat}`,
        label: cat,
        icon: cfg.icon,
        color: cfg.color,
        parentId: `type-${type}`,
        children: [],
      };
      for (const post of catPosts.slice(0, 10)) {
        catNode.children.push({
          id: `post-${post.slug}`,
          label: post.title,
          icon: cfg.icon,
          color: cfg.color,
          parentId: catNode.id,
          children: [],
          slug: `/braindump/${post.slug}`,
          excerpt: post.excerpt,
        });
      }
      typeNode.children.push(catNode);
    }
    nodes.push(typeNode);
  }
  return nodes;
}

function TreeNode({
  node,
  expanded,
  toggle,
  depth,
}: {
  node: MapNode;
  expanded: Set<string>;
  toggle: (id: string) => void;
  depth: number;
}) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const isLeaf = !hasChildren && !!node.slug;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2.5 px-3 border-l-2 active:bg-fg/5 transition-colors touch-manipulation"
        style={{
          borderLeftColor: isExpanded ? node.color : "transparent",
          marginLeft: depth * 16,
        }}
        onClick={() => hasChildren && toggle(node.id)}
      >
        {hasChildren ? (
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 text-fg-muted"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </motion.span>
        ) : (
          <span className="shrink-0 w-3" />
        )}

        <FontAwesomeIcon icon={node.icon} className="text-2xs shrink-0" style={{ color: node.color }} />

        {isLeaf ? (
          <Link
            href={node.slug!}
            className="font-mono text-sm text-fg hover:text-brutal-pink transition-colors truncate flex-1"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
            onClick={(e) => e.stopPropagation()}
          >
            {node.label}
          </Link>
        ) : (
          <span
            className="font-mono text-xs uppercase font-bold truncate flex-1"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color: node.color }}
          >
            {node.label}
          </span>
        )}

        {hasChildren && (
          <span className="font-mono text-2xs text-fg-muted shrink-0" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            {node.children.length}
          </span>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                expanded={expanded}
                toggle={toggle}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMap({ mapNodes }: { mapNodes: MapNode[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(mapNodes.map((n) => n.id)));
  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const expandAll = () => {
    const ids = new Set<string>();
    const walk = (n: MapNode[]) => n.forEach((x) => { ids.add(x.id); walk(x.children); });
    walk(mapNodes);
    setExpanded(ids);
  };
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="divide-y divide-fg-muted/10">
        {mapNodes.map((typeNode) => (
          <div key={typeNode.id} className="py-1">
            <div
              className="flex items-center gap-2 px-4 py-3 font-bold cursor-pointer touch-manipulation"
              style={{ color: typeNode.color }}
              onClick={() => toggle(typeNode.id)}
            >
              <motion.span animate={{ rotate: expanded.has(typeNode.id) ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </motion.span>
              <FontAwesomeIcon icon={typeNode.icon} className="text-sm" />
              <span className="font-display text-sm uppercase flex-1" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>
                {typeNode.label}
              </span>
              <span className="font-mono text-2xs opacity-50" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                {typeNode.children.length}
              </span>
            </div>
            <AnimatePresence>
              {expanded.has(typeNode.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {typeNode.children.map((cat) => (
                    <TreeNode key={cat.id} node={cat} expanded={expanded} toggle={toggle} depth={1} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopMap({ mapNodes }: { mapNodes: MapNode[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(mapNodes.map((n) => n.id)));
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => {
    const ids = new Set<string>();
    const walk = (n: MapNode[]) => n.forEach((x) => { ids.add(x.id); walk(x.children); });
    walk(mapNodes);
    setExpanded(ids);
  };
  const collapseAll = () => setExpanded(new Set());

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest(".map-canvas")) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const handleMouseUp = () => { isDragging.current = false; };

  useEffect(() => {
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
      }
    };
    window.addEventListener("wheel", handler, { passive: false });
    return () => window.removeEventListener("wheel", handler);
  }, []);

  return (
    <>
      <div className="px-4 py-2 border-b-2 border-fg bg-fg text-surface flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faBrain} />
          <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
            Knowledge Map
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="font-mono text-2xs uppercase px-2 py-1 border border-surface/30 hover:bg-surface hover:text-fg transition-colors cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            <FontAwesomeIcon icon={faPlus} /> Expand
          </button>
          <button onClick={collapseAll} className="font-mono text-2xs uppercase px-2 py-1 border border-surface/30 hover:bg-surface hover:text-fg transition-colors cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            <FontAwesomeIcon icon={faMinus} /> Collapse
          </button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="font-mono text-2xs uppercase px-2 py-1 border border-surface/30 hover:bg-surface hover:text-fg transition-colors cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            Reset
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="map-canvas relative flex-1 overflow-auto select-none"
        style={{ backgroundColor: "var(--surf)", cursor: isDragging.current ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          className="p-12 inline-block min-w-full min-h-full"
          style={{ transformOrigin: "0 0" }}
          animate={{ x: pan.x, y: pan.y, scale: zoom }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex gap-16 flex-wrap">
            {mapNodes.map((typeNode) => (
              <div key={typeNode.id} className="flex flex-col min-w-[240px]">
                <div className="mb-4">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 font-bold uppercase shadow-brutal-sm"
                    style={{ borderColor: typeNode.color, color: typeNode.color, backgroundColor: `${typeNode.color}08` }}
                  >
                    <FontAwesomeIcon icon={typeNode.icon} className="text-base" />
                    <span className="font-display text-base" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{typeNode.label}</span>
                    <span className="font-mono text-2xs opacity-50" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{typeNode.children.length}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {typeNode.children.map((catNode) => (
                    <MapBranch key={catNode.id} node={catNode} expanded={expanded} toggle={toggle} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="absolute bottom-3 left-3 font-mono text-2xs text-fg-muted/30 flex gap-3 pointer-events-none" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          <span>🖱️ Drag to pan</span>
          <span>⌃ Scroll to zoom</span>
        </div>
      </div>
    </>
  );
}

function MapBranch({
  node,
  expanded,
  toggle,
}: {
  node: MapNode;
  expanded: Set<string>;
  toggle: (id: string) => void;
}) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const isLeaf = !hasChildren && !!node.slug;
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <motion.div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div
          className={`flex items-center gap-2 px-3 py-2 border-2 transition-all cursor-pointer ${isLeaf ? "hover:shadow-brutal-sm" : ""}`}
          style={{ borderColor: hovered ? node.color : "var(--fg-muted)", backgroundColor: hovered ? `${node.color}10` : "var(--surf)", minWidth: 200 }}
          onClick={() => hasChildren && toggle(node.id)}
        >
          {hasChildren && (
            <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }} className="shrink-0">
              <FontAwesomeIcon icon={faChevronRight} className="text-xs text-fg-muted" />
            </motion.span>
          )}
          <FontAwesomeIcon icon={node.icon} className="text-xs shrink-0" style={{ color: node.color }} />
          {isLeaf ? (
            <Link href={node.slug!} className="font-mono text-xs text-fg hover:text-brutal-pink transition-colors truncate flex-1" style={{ fontFamily: TYPOGRAPHY.fontMono }} onClick={(e) => e.stopPropagation()}>
              {node.label}
            </Link>
          ) : (
            <span className="font-mono text-xs uppercase font-bold truncate flex-1" style={{ fontFamily: TYPOGRAPHY.fontMono, color: node.color }}>
              {node.label}
            </span>
          )}
          {hasChildren && (
            <span className="font-mono text-2xs text-fg-muted shrink-0" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{node.children.length}</span>
          )}
          {hovered && node.excerpt && (
            <span className="absolute left-full ml-2 font-sans text-xs text-fg-muted bg-surface border border-fg-muted/20 px-2 py-1 whitespace-nowrap z-10 hidden xl:block shadow-brutal-sm" style={{ fontFamily: TYPOGRAPHY.fontSans, maxWidth: 280 }}>
              {node.excerpt.slice(0, 100)}...
            </span>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
            style={{ marginLeft: 24, paddingLeft: 12, borderLeft: `2px solid ${node.color}30` }}
          >
            <div className="py-1 space-y-0.5">
              {node.children.map((child) => (
                <MapBranch key={child.id} node={child} expanded={expanded} toggle={toggle} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MindMap({ posts }: MindMapProps) {
  const mapNodes = buildMap(posts);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface">
      {/* Mobile: vertical accordion tree */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2 border-b-2 border-fg bg-fg text-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBrain} />
            <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
              Knowledge Map
            </span>
          </div>
          <span className="font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            {posts.length} nodes
          </span>
        </div>
        <MobileMap mapNodes={mapNodes} />
      </div>

      {/* Desktop: canvas with drag/pan/zoom */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        <DesktopMap mapNodes={mapNodes} />
      </div>
    </div>
  );
}
