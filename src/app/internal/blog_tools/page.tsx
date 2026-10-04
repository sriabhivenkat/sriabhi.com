"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import DashNav from "@/components/DashNav";
import Link from "next/link";
import {
    Pin,
    PinOff,
    Eye,
    EyeOff,
    Trash2,
    Save,
    Search,
    Plus,
    ImageOff,
    ChevronDown,
    ChevronUp,
    Loader2,
    FileText,
} from "lucide-react";

interface Post {
  file_url: string;
  title?: string;
  subtitle?: string;
  cover_photo?: string;
  minute_read?: number;
  date_created?: Date;
  id: string;
  active: boolean;
  blog_type: number;
  start_year: number | undefined;
  end_year: number | undefined;
  pinned: boolean;
}

type StatusFilter = "all" | "public" | "private" | "pinned";

export default function Page() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | undefined>();
    const [content, setContent] = useState("");
    const [originalContent, setOriginalContent] = useState("");
    const [contentLoading, setContentLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const isDirty = originalContent !== content;

    const handlePin = async(post: Post) => {
        await fetch("/api/blog/pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: post.id }),
        }).then(async (res) => {
            if (!res.ok) {
                throw new Error("Failed to pin post");
            }
            const data = await res.json();
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === post.id ? { ...p, pinned: data.pinned } : p
                )
            );
        }).catch((err) => {
            console.error("Failed to pin post:", err);
            alert("Failed to pin post");
        });
    };

    const handleSave = async() => {
        if (!selectedPost) return;
        setSaving(true);
        try {
            await fetch("/api/blog/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedPost.id, content }),
            });
            setOriginalContent(content);
            setVisible(true);
            setTimeout(() => setVisible(false), 1500);
        } finally {
            setSaving(false);
        }
    }

    const toggleStatus = async (post: Post) => {
        try {
            const res = await fetch("/api/blog/toggle-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: post.id }),
            });
            const data = await res.json();

            setPosts((prev) =>
                prev.map((p) =>
                    p.id === post.id ? { ...p, active: data.active } : p
                )
            );

            setSelectedPost((prev) =>
                prev ? { ...prev, active: data.active } : prev
            );
        } catch (err) {
            console.error("Failed to toggle post status:", err);
        }
    };

    const handleDelete = async (post: Post) => {
        if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        if (selectedPost?.id === post.id) {
            setSelectedPost(undefined);
        }

        await fetch("/api/blog/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: post.id }),
        }).then((res) => {
            if (!res.ok) {
                throw new Error("Failed to delete post");
            }
        }).catch((err) => {
            console.error("Failed to delete post:", err);
            alert("Failed to delete post");
        });
    };

    useEffect(() => {
        const main = async () => {
            setLoadingPosts(true);
            try {
                const res = await fetch("/api/list-posts");
                const data: Post[] = await res.json();

                setPosts(
                    data
                    .map((p) => ({ ...p, date_created: new Date(p.date_created as any) }))
                    .filter((p) => p.title !== "abhi_resume")
                    .sort((a, b) => +b.date_created! - +a.date_created!)
                );
            } finally {
                setLoadingPosts(false);
            }
        };

        main();
    }, []);

    useEffect(() => {
        if (!selectedPost) return;
        const loadMarkdown = async () => {
            setContentLoading(true);
            try {
                const res = await fetch(`/api/blog-content?id=${encodeURIComponent(selectedPost.id)}`);
                const text = await res.text();
                setOriginalContent(text);
                setContent(text);
            } catch (err) {
                console.error("Failed to load markdown:", err);
                setContent("Failed to load content.");
            } finally {
                setContentLoading(false);
            }
        };
        loadMarkdown();
    }, [selectedPost]);

    const pinnedCount = posts.filter((p) => p.pinned).length;

    const visiblePosts = useMemo(() => {
        return posts
            .filter((p) => {
                if (statusFilter === "public" && !p.active) return false;
                if (statusFilter === "private" && p.active) return false;
                if (statusFilter === "pinned" && !p.pinned) return false;
                if (search && !(p.title || "").toLowerCase().includes(search.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => {
                if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                return +b.date_created! - +a.date_created!;
            });
    }, [posts, search, statusFilter]);

    const filters: { key: StatusFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "public", label: "Public" },
        { key: "private", label: "Private" },
        { key: "pinned", label: "Pinned" },
    ];

    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden
                 bg-[#F4F2F3]
                 flex flex-col p-2"
        >
            <DashNav />
            <div className="flex flex-col mt-14 px-1">
                <div className="flex flex-row items-start justify-between gap-3">
                    <div className="flex flex-col">
                        <h1 className="text-2xl sm:text-3xl font-serif-custom font-black text-[#3D2B2E]">
                            Blog Tools
                        </h1>
                        <p className="text-xs sm:text-sm text-black/50 mt-0.5">
                            {loadingPosts
                                ? "Loading posts..."
                                : `${posts.length} post${posts.length === 1 ? "" : "s"} · ${pinnedCount}/4 pinned`}
                        </p>
                    </div>
                    <Link
                        href={"/internal/blog_tools/create_blog_post"}
                        className="flex items-center gap-1.5 bg-[#3D2B2E] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#3D2B2E]/90 transition-colors shrink-0"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add blog post</span>
                        <span className="sm:hidden">Add</span>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search posts by title..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#3D2B2E]/30"
                        />
                    </div>
                    <div className="flex gap-1 bg-white/40 border border-black/10 rounded-lg p-1 self-start">
                        {filters.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors hover:cursor-pointer ${
                                    statusFilter === f.key
                                        ? "bg-[#3D2B2E] text-white"
                                        : "text-black/60 hover:bg-black/5"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col flex-1 overflow-y-auto p-1 mt-3 gap-2">
                {loadingPosts && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-black/40 py-16">
                        <Loader2 size={24} className="animate-spin" />
                        <p className="text-sm">Loading posts...</p>
                    </div>
                )}

                {!loadingPosts && visiblePosts.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-black/40 py-16">
                        <FileText size={28} />
                        <p className="text-sm">
                            {search || statusFilter !== "all" ? "No posts match your filters." : "No posts yet."}
                        </p>
                    </div>
                )}

                {visiblePosts.map((item) => {
                    const isOpen = selectedPost?.id === item.id;
                    const globalIndex = posts.findIndex((p) => p.id === item.id);
                    return (
                        <div
                            key={item.id}
                            className={`rounded-lg bg-white/50 backdrop-blur-sm border transition-colors flex flex-col ${
                                isOpen ? "border-[#3D2B2E]/30 shadow-sm" : "border-black/10"
                            }`}
                        >
                            <div className="p-2.5 flex flex-col sm:flex-row gap-2 sm:gap-0">
                                <button
                                    className="flex items-center gap-2.5 min-w-0 text-left hover:cursor-pointer flex-1"
                                    onClick={() => setSelectedPost(isOpen ? undefined : item)}
                                >
                                    <p className="text-black/30 text-xs font-bold shrink-0 w-4 text-right">{globalIndex + 1}</p>

                                    {item.cover_photo ? (
                                        <Image
                                            className="h-11 w-11 rounded-md object-cover shrink-0"
                                            src={item.cover_photo}
                                            height={44}
                                            width={44}
                                            alt=""
                                        />
                                    ) : (
                                        <div className="h-11 w-11 rounded-md bg-black/5 flex items-center justify-center shrink-0">
                                            <ImageOff size={16} className="text-black/25" />
                                        </div>
                                    )}

                                    <div className="flex flex-col min-w-0 gap-0.5">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            {item.pinned && (
                                                <Pin size={12} className="text-amber-600 fill-amber-500 shrink-0" />
                                            )}
                                            <p className="text-black text-base sm:text-lg font-bold font-serif-custom truncate">
                                                {item.title}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                            <span className="text-black/45">
                                                {item.date_created?.toLocaleDateString()}
                                            </span>
                                            {item.blog_type === 2 && (
                                                <span className="px-1.5 py-0.5 rounded-full bg-[#9999C3]/20 text-[#3D2B2E] text-[10px] font-semibold">
                                                    Project
                                                </span>
                                            )}
                                            <span
                                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    item.active
                                                        ? "bg-green-500/15 text-green-700"
                                                        : "bg-black/10 text-black/50"
                                                }`}
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${item.active ? "bg-green-500" : "bg-black/30"}`} />
                                                {item.active ? "Public" : "Private"}
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                <div className="flex flex-wrap gap-1 items-center justify-end sm:ml-2">
                                    {isDirty && isOpen && (
                                        <button
                                            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md hover:bg-green-100 hover:cursor-pointer text-green-700 bg-green-50 font-medium"
                                            onClick={handleSave}
                                            disabled={saving}
                                            title="Save changes"
                                        >
                                            {saving ? (
                                                <Loader2 size={13} className="animate-spin" />
                                            ) : (
                                                <Save size={13} />
                                            )}
                                            {visible ? "Saved!" : saving ? "Saving..." : "Save"}
                                        </button>
                                    )}
                                    <button
                                        className={`p-1.5 rounded-md hover:cursor-pointer ${
                                            pinnedCount >= 4 && !item.pinned
                                            ? "opacity-30 cursor-not-allowed"
                                            : "hover:bg-black/5 text-black/60"
                                        }`}
                                        onClick={() => handlePin(item)}
                                        disabled={pinnedCount >= 4 && !item.pinned}
                                        title={item.pinned ? "Unpin post" : "Pin post"}
                                    >
                                        {item.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                                    </button>
                                    <button
                                        className="p-1.5 rounded-md hover:bg-black/5 hover:cursor-pointer text-black/60"
                                        onClick={() => toggleStatus(item)}
                                        title={item.active ? "Take private" : "Take public"}
                                    >
                                        {item.active ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                    <button
                                        className="p-1.5 rounded-md hover:bg-red-50 hover:cursor-pointer text-red-500"
                                        onClick={() => handleDelete(item)}
                                        title="Delete post"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                    <button
                                        className="p-1.5 rounded-md hover:bg-black/5 hover:cursor-pointer text-black/60"
                                        onClick={() => setSelectedPost(isOpen ? undefined : item)}
                                        title={isOpen ? "Close content" : "Open content"}
                                    >
                                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                            </div>

                            {isOpen && (
                                <div className="w-full px-2.5 pb-2.5 flex flex-col sm:flex-row h-[85vh] sm:h-[60vh] gap-2 sm:gap-0">
                                    {contentLoading ? (
                                        <div className="w-full flex items-center justify-center text-black/30">
                                            <Loader2 size={20} className="animate-spin" />
                                        </div>
                                    ) : (
                                        <>
                                            <textarea
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                placeholder="Write your blog post in Markdown..."
                                                className="w-full sm:w-1/2 h-1/2 sm:h-full p-3 text-black rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 overflow-y-auto bg-white"
                                            />

                                            <div className="w-full sm:w-1/2 h-1/2 sm:h-full p-4 sm:p-5 border border-gray-300 rounded-lg bg-white overflow-y-auto sm:ml-2">
                                                <div className="prose prose-sm sm:prose-lg max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            h1: ({node, ...props}) => <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-black" {...props} />,
                                                            h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl font-bold mb-3 text-black" {...props} />,
                                                            h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl font-bold mb-2 text-black" {...props} />,
                                                            ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 text-black" {...props} />,
                                                            ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 text-black" {...props} />,
                                                            li: ({node, ...props}) => <li className="mb-1 text-black" {...props} />,
                                                            p: ({node, ...props}) => <p className="mb-4 text-black" {...props} />,
                                                            code: ({node, inline, ...props}: any) =>
                                                            inline
                                                                ? <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />
                                                                : <code className="block bg-gray-100 p-4 rounded mb-4 overflow-x-auto" {...props} />,
                                                            table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="table-auto border-collapse border border-gray-300 w-full" {...props} /></div>,
                                                            thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
                                                            tbody: ({node, ...props}) => <tbody {...props} />,
                                                            tr: ({node, ...props}) => <tr className="border-b border-gray-300" {...props} />,
                                                            th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 text-left font-bold" {...props} />,
                                                            td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                                                            img: ({ node, ...props }) => (
                                                                <div className="flex justify-center my-6">
                                                                <figure className="inline-block">
                                                                    <img
                                                                    className="max-w-full max-h-96 rounded-lg block"
                                                                    {...props}
                                                                    alt={props.alt || "Image"}
                                                                    />
                                                                    {props.title && (
                                                                    <figcaption className="mt-2 text-left text-sm italic text-gray-500">
                                                                        {props.title}
                                                                    </figcaption>
                                                                    )}
                                                                </figure>
                                                                </div>
                                                            ),
                                                        }}
                                                    >
                                                        {content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
