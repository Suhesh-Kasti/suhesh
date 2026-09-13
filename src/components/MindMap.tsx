"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import type { BrainDumpMeta, ContentType } from "@/lib/braindump";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faBook,
  faLightbulb,
  faClipboardCheck,
  faFileCode,
  faBrain,
  faPlus,
  faMinus,
  faRoad,
  faFlask,
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
  roadmap: { label: "Roadmaps", icon: faRoad, color: COLORS.teal },
  lab: { label: "Labs & Walkthroughs", icon: faFlask, color: COLORS.orange },
};

function buildMap(posts: BrainDumpMeta[]): MapNode[] {
  const nodes: MapNode[] = [];

  // Separate posts by type
  const seriesPosts = posts.filter((p) => p.type === "roadmap");
  const labPosts = posts.filter((p) => p.type === "lab");
  const otherPosts = posts.filter((p) => p.type !== "roadmap" && p.type !== "lab");

  // Build Roadmaps node with nested lab walkthroughs
  if (seriesPosts.length > 0 || labPosts.length > 0) {
    const roadmapNode: MapNode = {
      id: "type-series",
      label: "Roadmaps",
      icon: faRoad,
      color: COLORS.teal,
      parentId: null,
      children: [],
    };

    // Group series by category (e.g., "PortSwigger Academy", "HTB CPTS")
    const seriesCategories: Record<string, BrainDumpMeta[]> = {};
    for (const post of seriesPosts) {
      const cat = post.category || "Uncategorized";
      if (!seriesCategories[cat]) seriesCategories[cat] = [];
      seriesCategories[cat].push(post);
    }

    // Group labs by category
    const labCategories: Record<string, BrainDumpMeta[]> = {};
    for (const post of labPosts) {
      const cat = post.category || "Uncategorized";
      if (!labCategories[cat]) labCategories[cat] = [];
      labCategories[cat].push(post);
    }

    for (const [cat, catSeries] of Object.entries(seriesCategories)) {
      const catNode: MapNode = {
        id: `cat-series-${cat}`,
        label: cat,
        icon: faRoad,
        color: COLORS.teal,
        parentId: "type-series",
        children: [],
      };

      // Add the series index as a clickable node
      for (const s of catSeries) {
        catNode.children.push({
          id: `post-${s.slug}`,
          label: s.title,
          icon: faRoad,
          color: COLORS.teal,
          parentId: catNode.id,
          children: [],
          slug: `/braindump/${s.slug}`,
          excerpt: s.excerpt,
        });
      }

      // Nest matching lab walkthroughs under this roadmap category
      if (labCategories[cat]) {
        for (const lab of labCategories[cat].slice(0, 20)) {
          catNode.children.push({
            id: `post-${lab.slug}`,
            label: lab.title,
            icon: faFlask,
            color: COLORS.orange,
            parentId: catNode.id,
            children: [],
            slug: `/braindump/${lab.slug}`,
            excerpt: lab.excerpt,
          });
        }
        delete labCategories[cat];
      }

      roadmapNode.children.push(catNode);
    }

    // Remaining orphan labs (no matching roadmap) get their own category
    for (const [cat, catLabs] of Object.entries(labCategories)) {
      const catNode: MapNode = {
        id: `cat-series-${cat}`,
        label: cat,
        icon: faFlask,
        color: COLORS.orange,
        parentId: "type-series",
        children: [],
      };
      for (const lab of catLabs.slice(0, 20)) {
        catNode.children.push({
          id: `post-${lab.slug}`,
          label: lab.title,
          icon: faFlask,
          color: COLORS.orange,
          parentId: catNode.id,
          children: [],
          slug: `/braindump/${lab.slug}`,
          excerpt: lab.excerpt,
        });
      }
      roadmapNode.children.push(catNode);
    }

    nodes.push(roadmapNode);
  }

  // Build rest of the types (blog, til, cheatsheet, checklist, braindump)
  for (const [type, cfg] of Object.entries(TYPE_CONFIG)) {
    if (type === "roadmap" || type === "lab") continue;
    const typePosts = otherPosts.filter((p) => p.type === type);
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

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;

function DesktopMap({ mapNodes }: { mapNodes: MapNode[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(mapNodes.map((n) => n.id)));
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const zoomLabelRef = useRef<HTMLSpanElement>(null);

  // The camera lives in a ref and is written straight to the DOM. Panning re-renders nothing,
  // which matters because this tree holds every post on the site — going through React state
  // on every mousemove was what made the canvas lag and drift.
  const view = useRef({ x: 0, y: 0, zoom: 1 });
  const drag = useRef<{ id: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  const applyView = useCallback(() => {
    const { x, y, zoom } = view.current;
    if (contentRef.current) {
      contentRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${zoom})`;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      // The grid is the canvas's own background, so it repeats forever with no giant layer.
      canvas.style.backgroundPosition = `${x}px ${y}px`;
      canvas.style.backgroundSize = `${40 * zoom}px ${40 * zoom}px`;
    }
    if (zoomLabelRef.current) {
      zoomLabelRef.current.textContent = `${Math.round(zoom * 100)}%`;
    }
  }, []);

  // Keep at least a slice of the map on screen, so it stays an infinite canvas without ever
  // letting the content wander off and get lost.
  const clampView = useCallback(() => {
    const el = contentRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const v = view.current;
    const w = el.offsetWidth * v.zoom;
    const h = el.offsetHeight * v.zoom;
    const marginX = Math.min(canvas.clientWidth * 0.5, Math.max(80, w * 0.5));
    const marginY = Math.min(canvas.clientHeight * 0.5, Math.max(80, h * 0.5));
    v.x = Math.min(Math.max(v.x, -w + marginX), canvas.clientWidth - marginX);
    v.y = Math.min(Math.max(v.y, -h + marginY), canvas.clientHeight - marginY);
  }, []);

  useEffect(() => {
    applyView();
  }, [applyView]);

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

  const resetView = () => {
    view.current = { x: 0, y: 0, zoom: 1 };
    applyView();
  };

  // Ctrl/Cmd + wheel zooms toward the pointer. A plain wheel is left alone so trackpad
  // momentum scrolls the page instead of flinging the canvas around.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const v = view.current;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * Math.exp(-e.deltaY * 0.002)));
      const k = next / v.zoom;
      // keep the point under the cursor fixed while zooming
      v.x = px - (px - v.x) * k;
      v.y = py - (py - v.y) * k;
      v.zoom = next;
      clampView();
      applyView();
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [applyView, clampView]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Never start a drag from a node or a toolbar control — that is what made clicking a link
    // throw the whole map sideways.
    if ((e.target as HTMLElement).closest("a, button")) return;
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: view.current.x,
      originY: view.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    view.current.x = d.originX + (e.clientX - d.startX);
    view.current.y = d.originY + (e.clientY - d.startY);
    clampView();
    applyView();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    e.currentTarget.style.cursor = "grab";
  };

  return (
    <>
      <div className="px-4 py-2 border-b-2 border-fg bg-fg text-surface flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faBrain} />
          <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
            Knowledge Map
          </span>
          <span ref={zoomLabelRef} className="font-mono text-2xs opacity-60" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            100%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="font-mono text-2xs uppercase px-2 py-1 border border-surface/30 hover:bg-surface hover:text-fg transition-colors cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            <FontAwesomeIcon icon={faPlus} /> Expand
          </button>
          <button onClick={collapseAll} className="font-mono text-2xs uppercase px-2 py-1 border border-surface/30 hover:bg-surface hover:text-fg transition-colors cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            <FontAwesomeIcon icon={faMinus} /> Collapse
          </button>
          <button onClick={resetView} className="font-mono text-2xs uppercase px-2 py-1 border border-surface/30 hover:bg-surface hover:text-fg transition-colors cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            Reset
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="map-canvas relative flex-1 select-none overflow-hidden"
        style={{
          cursor: "grab",
          touchAction: "none",
          backgroundColor: "var(--surf)",
          backgroundImage:
            "linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          ref={contentRef}
          className="absolute p-12"
          style={{ transformOrigin: "0 0", willChange: "transform" }}
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
        </div>
        <div className="absolute bottom-3 left-3 font-mono text-2xs text-fg-muted/40 flex gap-3 pointer-events-none z-10" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          <span>Drag to pan</span>
          <span>Ctrl+Scroll to zoom</span>
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
