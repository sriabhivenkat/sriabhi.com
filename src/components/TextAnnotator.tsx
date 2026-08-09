"use client";
import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";

type AnnotationData = {
  annotation_id: string;
  start_offset: number;
  end_offset: number;
  selected_text: string;
  content: string;
  commenter_name: string;
  created_at: string | null;
};

type Props = {
  postId: string;
  children: React.ReactNode;
};

const CARD_GAP = 10;
const MARGIN_WIDTH_PX = 280;

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return { backgroundColor: `hsl(${hue}, 55%, 92%)`, color: `hsl(${hue}, 45%, 32%)` };
}

export default function TextAnnotator({ postId, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const marginRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [canAnnotate, setCanAnnotate] = useState(false);
  const [myName, setMyName] = useState("You");
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [rawTops, setRawTops] = useState<Record<string, number>>({});
  const [resolvedTops, setResolvedTops] = useState<Record<string, number>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [pendingSelection, setPendingSelection] = useState<{
    x: number; viewportY: number; docY: number; start: number; end: number; text: string;
  } | null>(null);
  const [draft, setDraft] = useState<{
    start: number; end: number; text: string; top: number;
  } | null>(null);
  const [draftText, setDraftText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [mobileSheet, setMobileSheet] = useState<AnnotationData | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch("https://home.sriabhi.com/api/v1/comment_access_status", {
          credentials: "include",
        });
        const data = await res.json();
        console.log("RES: ", data)
        // setCanAnnotate(data.status === "approved");
        // if (data.first_name) setMyName(data.first_name);
        // Tester data
        setCanAnnotate(true)
        setMyName("Abhi")
      } catch (e) {
        console.error(e);
      }
    };
    checkAccess();
  }, []);

//   const loadAnnotations = useCallback(async () => {
//     try {
//       const res = await fetch(
//         `https://home.sriabhi.com/api/v1/annotations?post_id=${encodeURIComponent(postId)}`
//       );
//       const data = await res.json();
//       setAnnotations(Array.isArray(data) ? data : []);
//     } catch (e) {
//       console.error(e);
//     }
//   }, [postId]);

//   useEffect(() => {
//     loadAnnotations();
//   }, [loadAnnotations]);

  const getTextOffset = (root: HTMLElement, node: Node, nodeOffset: number) => {
    let offset = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current: Node | null;
    while ((current = walker.nextNode())) {
      if (current === node) return offset + nodeOffset;
      offset += current.textContent?.length ?? 0;
    }
    return offset;
  };

  const makeRangeFromOffsets = (container: HTMLElement, start: number, end: number) => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let offset = 0;
    let startNode: Node | null = null, startOffset = 0;
    let endNode: Node | null = null, endOffset = 0;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const len = node.textContent?.length ?? 0;
      if (startNode === null && offset + len >= start) {
        startNode = node;
        startOffset = start - offset;
      }
      if (endNode === null && offset + len >= end) {
        endNode = node;
        endOffset = end - offset;
        break;
      }
      offset += len;
    }
    if (!startNode || !endNode) return null;
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  };

const handleMouseUp = () => {
    if (!canAnnotate || !containerRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;

    const text = selection.toString().trim();
    if (!text) return;

    const start = getTextOffset(containerRef.current, range.startContainer, range.startOffset);
    const end = getTextOffset(containerRef.current, range.endContainer, range.endOffset);
    const rect = range.getBoundingClientRect();

    setPendingSelection({
        x: rect.right,
        viewportY: rect.top,               // for the fixed "+ Comment" pill
        docY: rect.top + window.scrollY,   // for the draft card's document-relative top
        start: Math.min(start, end),
        end: Math.max(start, end),
        text,
    });
};

const openDraft = () => {
  if (!pendingSelection || !containerRef.current) return;
  const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
  setDraft({
    start: pendingSelection.start,
    end: pendingSelection.end,
    text: pendingSelection.text,
    top: pendingSelection.docY - containerTop,
  });
  setPendingSelection(null);
  setDraftText("");
};

  const submitDraft = async () => {
    if (!draft || !draftText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("https://home.sriabhi.com/api/v1/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          post_id: postId,
          start_offset: draft.start,
          end_offset: draft.end,
          selected_text: draft.text,
          content: draftText.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to save annotation");
      const created = await res.json();
      setAnnotations((prev) => [...prev, created]);
      setDraft(null);
      setDraftText("");
      window.getSelection()?.removeAllRanges();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll("mark[data-annotation-id]").forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      parent.normalize();
    });

    const tops: Record<string, number> = {};
    const containerTop = container.getBoundingClientRect().top;

    annotations.forEach((a) => {
      const range = makeRangeFromOffsets(container, a.start_offset, a.end_offset);
      if (!range) return;

      tops[a.annotation_id] = range.getBoundingClientRect().top - containerTop;

      const mark = document.createElement("mark");
      mark.dataset.annotationId = a.annotation_id;
      mark.className = "annotation-mark bg-transparent border-b-2 border-amber-400 cursor-pointer transition-colors";
      mark.addEventListener("mouseenter", () => setHoveredId(a.annotation_id));
      mark.addEventListener("mouseleave", () => setHoveredId(null));
      mark.addEventListener("click", () => {
        if (window.innerWidth < 1024) setMobileSheet(a);
      });
      try {
        range.surroundContents(mark);
      } catch {
        // Selection crossed an element boundary — skip highlighting this
        // one rather than risk corrupting the DOM.
      }
    });

    setRawTops(tops);
  }, [annotations]);

  useLayoutEffect(() => {
    const ids = Object.keys(rawTops).sort((a, b) => rawTops[a] - rawTops[b]);
    const next: Record<string, number> = {};
    let cursor = -Infinity;

    for (const id of ids) {
      const height = cardRefs.current[id]?.offsetHeight ?? 70;
      const top = Math.max(rawTops[id], cursor);
      next[id] = top;
      cursor = top + height + CARD_GAP;
    }
    setResolvedTops(next);
  }, [rawTops, annotations]);

  return (
    <div className="relative">
      <div ref={containerRef} onMouseUp={handleMouseUp}>
        {children}
      </div>

      <div
        className="hidden lg:block absolute top-0"
        style={{ left: "100%", width: MARGIN_WIDTH_PX, marginLeft: 24 }}
        ref={marginRef}
      >
        {annotations.map((a) => {
          const color = colorForName(a.commenter_name);
          const isActive = hoveredId === a.annotation_id;
          return (
            <div
              key={a.annotation_id}
              ref={(el) => { cardRefs.current[a.annotation_id] = el; }}
              onMouseEnter={() => setHoveredId(a.annotation_id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`absolute w-full rounded-xl border p-3 transition-shadow bg-white ${
                isActive ? "border-amber-300 shadow-md" : "border-neutral-200 shadow-sm"
              }`}
              style={{ top: resolvedTops[a.annotation_id] ?? rawTops[a.annotation_id] ?? 0 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold"
                  style={color}
                >
                  {initials(a.commenter_name)}
                </div>
                <p className="text-xs font-medium text-black">{a.commenter_name}</p>
              </div>
              <p className="text-sm text-black">{a.content}</p>
            </div>
          );
        })}

        {draft && (
          <div
            className="absolute w-full rounded-xl border border-[#3D2B2E]/40 shadow-md p-3 bg-white"
            style={{ top: draft.top }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-6 w-6 shrink-0 rounded-full bg-[#3D2B2E]/10 text-[#3D2B2E] flex items-center justify-center text-[10px] font-semibold">
                {initials(myName)}
              </div>
              <p className="text-xs font-medium text-black">{myName}</p>
            </div>
            <p className="text-[11px] text-neutral-400 mb-1.5 line-clamp-2">
              &ldquo;{draft.text}&rdquo;
            </p>
            <textarea
              autoFocus
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="w-full border border-gray-300 rounded-md p-1.5 text-xs text-black resize-none focus:outline-none focus:ring-2 focus:ring-[#3D2B2E]/30"
            />
            <div className="flex justify-end gap-1.5 mt-1.5">
              <button
                onClick={() => { setDraft(null); setDraftText(""); }}
                className="text-xs text-neutral-500 px-2 py-1 hover:text-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitDraft}
                disabled={submitting || !draftText.trim()}
                className="text-xs bg-[#3D2B2E] text-white px-2.5 py-1 rounded-md hover:bg-[#6B4C51] disabled:opacity-50 transition-colors"
              >
                {submitting ? "Posting..." : "Comment"}
              </button>
            </div>
          </div>
        )}
      </div>

    {pendingSelection && (
        <button
            onClick={openDraft}
            className="fixed z-50 bg-[#3D2B2E] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:bg-[#6B4C51] transition-colors"
            style={{
            left: pendingSelection.x + 8,
            top: pendingSelection.viewportY - 10,
            transform: "translateY(-100%)",
            }}
        >
            + Comment
        </button>
    )}  

      {mobileSheet && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/20"
          onClick={() => setMobileSheet(null)}
        >
          <div
            className="w-full bg-white rounded-t-2xl shadow-lg p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold"
                style={colorForName(mobileSheet.commenter_name)}
              >
                {initials(mobileSheet.commenter_name)}
              </div>
              <p className="text-sm font-medium text-black">{mobileSheet.commenter_name}</p>
            </div>
            <p className="text-[11px] text-neutral-400 mb-1.5">
              &ldquo;{mobileSheet.selected_text}&rdquo;
            </p>
            <p className="text-sm text-black">{mobileSheet.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}