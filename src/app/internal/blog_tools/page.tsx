"use client";
import React, { useEffect, useState, useRef } from "react";
import { getAccessToken, getStoredAccessToken } from "../../../../functions/abhiPcCalls";
import Login from "@/components/Login";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import DashNav from "@/components/DashNav";
import Link from "next/link";

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
export default function Page() {
    const [token, setToken] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    useEffect(() => {
        const t = getStoredAccessToken();
        setToken(t);
        setChecked(true);
    }, []);

    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | undefined>();
    const [content, setContent] = useState("");
    const [originalContent, setOriginalContent] = useState("");
    const [visible, setVisible] = useState(false);
    const handlePin = async(post: Post) => {
        const {access_token} = await getAccessToken();
        await fetch(`https://home.sriabhi.com/api/v1/pin_post/${post.id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
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
        const { access_token } = await getAccessToken();
        const form = new FormData();
        const blob = new Blob([content], {"type": "text/markdown"})
        
        form.append("file", blob, "post.md")
        if (selectedPost) {
            await fetch(`https://home.sriabhi.com/api/v1/update_blog_file/${selectedPost.id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                body: form,
            });
            setVisible(true)
            setOriginalContent(content)
            setVisible(false)
        }
    }

    const toggleStatus = async (post: Post) => {
        const { access_token } = await getAccessToken();

        try {
            const res = await fetch(
                `https://home.sriabhi.com/api/v1/update_blog_status/${post.id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );
            const data = await res.json();

            // Update posts array in state
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === post.id ? { ...p, active: data.active } : p
                )
            );

            // Update selectedPost so the button label changes
            setSelectedPost((prev) =>
                prev ? { ...prev, active: data.active } : prev
            );
        } catch (err) {
            console.error("Failed to toggle post status:", err);
        }
    };

    
      
    useEffect(() => {
        const main = async () => {
            const { access_token } = await getAccessToken();
            const res = await fetch(
                "https://home.sriabhi.com/api/v1/list_files",
                {
                headers: { Authorization: `Bearer ${access_token}` },
                }
            );
        
            const data: Post[] = await res.json();
        
            setPosts(
                data
                .map((p) => ({ ...p, date_created: new Date(p.date_created as any) }))
                .filter((p) => p.title !== "abhi_resume")
                .sort((a, b) => +b.date_created! - +a.date_created!)
            );
        };
    
        main();
    }, []);

    useEffect(() => {
        if (!selectedPost || !token) return;
        const loadMarkdown = async () => {
            try {
                const url = "https://home.sriabhi.com/" + selectedPost.file_url
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const text = await res.text();
                setOriginalContent(text);
                setContent(text);
            } catch (err) {
                console.error("Failed to load markdown:", err);
                setContent("Failed to load content.");
            }
        };
        loadMarkdown();
    }, [selectedPost, token]);

    return token ? (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden
                 bg-[#F4F2F3]
                 flex flex-col p-2"
        >
            <DashNav />
            <div className="flex flex-row items-center justify-between mt-12 p-2">
                <h1 className="text-2xl sm:text-3xl font-serif-custom font-black text-black">
                    Blog Tools
                </h1>
                <Link
                    href={"/internal/blog_tools/create_blog_post"}
                    className="border border-black px-2 py-1 rounded-lg text-black text-sm hover:cursor-pointer"
                >
                    Add blog post
                </Link>
            </div>

            <div className="w-full flex flex-col flex-1 overflow-y-auto p-2">
                {posts.map((item, index) => (
                    <div
                        key={index}
                        className={`${index === 0 ? "border-t" : ""} border-b border-gray-300 p-2 flex flex-col`}
                    >
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <p className="text-gray-400 text-xs font-bold shrink-0">{index + 1}</p>

                            <Image
                                className="h-10 w-10 rounded-md object-cover shrink-0"
                                src={item.cover_photo || ""}
                                height={40}
                                width={40}
                                alt=""
                            />

                            <div className="flex flex-col min-w-0">
                                <p className="text-black text-xl sm:text-lg font-bold font-serif-custom truncate">
                                    {item.title}
                                </p>
                                <p className="text-black text-xs">
                                    {item.date_created?.toLocaleDateString()} {item.blog_type === 2 && 
                                        <span className="text-sm font-semibold font-serif-custom">
                                            · Project
                                        </span>
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="sm:ml-auto flex flex-wrap gap-2 items-center">
                            {originalContent !== content && item == selectedPost &&
                                <button
                                    className="text-xs px-2 py-1 rounded-md hover:bg-gray-200 hover:cursor-pointer text-green-600 bg-green-50 sm:bg-transparent"
                                    onClick={handleSave}
                                >
                                    {visible ? "Saved!" : "Save"}
                                </button>
                            }
                            <button
                                className={`text-xs px-2 py-1 rounded-md text-black bg-gray-100 sm:bg-transparent ${
                                    posts.filter((p) => p.pinned).length >= 4 && !item.pinned
                                    ? "opacity-40 cursor-not-allowed"
                                    : "hover:bg-gray-200 hover:cursor-pointer"
                                }`}
                                onClick={() => handlePin(item)}
                                disabled={posts.filter((p) => p.pinned).length >= 4 && !item.pinned}
                            >
                                {item.pinned ? "Unpin" : "Pin"}
                            </button>
                            <button
                                className="text-xs px-2 py-1 rounded-md hover:bg-gray-200 hover:cursor-pointer text-black bg-gray-100 sm:bg-transparent"
                                onClick={() => {
                                if (selectedPost === item) {
                                    setSelectedPost(undefined);
                                } else {
                                    setSelectedPost(item);
                                }
                                }}
                            >
                                {selectedPost === item ? "Close content" : "Open content"}
                            </button>
                            <button 
                                className="text-xs px-2 py-1 rounded-md hover:bg-gray-200 hover:cursor-pointer text-black bg-gray-100 sm:bg-transparent"
                                onClick={() => toggleStatus(item)}
                            >
                                {item.active ? "Take private" : "Take public"}
                            </button>
                            <button
                                className="text-xs px-2 py-1 rounded-md hover:bg-gray-200 hover:cursor-pointer text-red-600 bg-red-50 sm:bg-transparent"
                                onClick={async() => {
                                    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                                        // Optimistically update UI
                                        setPosts((prev) => prev.filter((p) => p.id !== item.id)); 
                                        if (selectedPost === item) {
                                            setSelectedPost(undefined);
                                        }

                                        const { access_token } = await getAccessToken();
                                        await fetch(`https://home.sriabhi.com/api/v1/delete/${item.id}`, {
                                            method: "DELETE",
                                            headers: {
                                                Authorization: `Bearer ${access_token}`,
                                            },
                                        }).then((res) => {
                                            if (!res.ok) {
                                                throw new Error("Failed to delete post");
                                            }
                                            alert("Post deleted successfully");
                                        })
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    {selectedPost === item && (
                        <div className="w-full mt-2 flex flex-col sm:flex-row h-[85vh] sm:h-[60vh] gap-2 sm:gap-0">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your blog post in Markdown..."
                                className="w-full sm:w-1/2 h-1/2 sm:h-full p-3 text-black rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 overflow-y-auto"
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
                        </div>
                    )}
                    </div>
                ))}
            </div>
        </div>
    ) : (
        <Login onLoginSuccess={(t) => setToken(t)} />
    )
}