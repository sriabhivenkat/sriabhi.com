"use client";
import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import { getAccessToken } from "../../../../functions/abhiPcCalls";
import remarkGfm from 'remark-gfm'

interface Post {
  file_url: string;
  title?: string;
  subtitle?: string;
  cover_photo?: string;
  minute_read?: number;
  date_created?: Date;
  id: string;
}

export default function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);  // <-- unwrap the Promise with React.use()

  const [content, setContent] = useState<string>("");
  const [post, setPost] = useState<Post>();
  const [token, setToken] = useState<string>("");

  // Fetch token + list of posts
  useEffect(() => {
    const main = async () => {
      const { access_token } = await getAccessToken();
      setToken(access_token);

      const res = await fetch("https://home.sriabhi.com/api/v1/list_files", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const data = await res.json();
      const newPosts = data.map((p: any) => ({
        ...p,
        date_created: new Date(p.date_created),
      }));

      console.log("ID:", id);
      console.log("POST:", newPosts.find((p: Post) => p.id === id));

      setPost(newPosts.find((p: Post) => p.id === id));
    };

    main();
  }, [id]);

  // Fetch markdown file
  useEffect(() => {
    if (!post || !token) return;

    const loadMarkdown = async () => {
      try {
        const url = "https://home.sriabhi.com/" + post.file_url
        console.log("URL: ", url)
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        setContent(text);
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setContent("Failed to load content.");
      }
    };

    loadMarkdown();
  }, [post, token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#F4F2F3] p-5">
      <Navbar />
      <div className="flex flex-col items-center w-full max-w-4xl">
        <div className="w-full flex flex-col items-center mb-5">
            <img
                src={post?.cover_photo}
                className="w-full max-h-96 object-cover rounded-lg mb-4"
                alt="Cover preview"
            />
            <h1 className="text-3xl md:text-5xl font-serif-custom text-black font-black">
                {post?.title}
            </h1>
            <h2 className="text-md md:text-lg text-black">
                {post?.subtitle}
            </h2>
        </div>
        <div className="mb-5 border-b-1 border-gray-400 pb-1">
            
            <p className="text-black text-lg md:text-xl font-serif-custom">
                Sriabhi Venkat | {post?.date_created?.toLocaleString('en-US', {
                        hour: 'numeric', minute: 'numeric', hour12: true,
                        month: '2-digit', day: '2-digit', year: 'numeric',
                    })} | {post?.minute_read} minute read
            </p>
        </div>
        <div className="flex flex-col flex-1 mx-auto prose prose-lg text-black">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 text-black" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 text-black" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2 text-black" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 text-black" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 text-black" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1 text-black" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-black" {...props} />,
                    code: ({node, inline, ...props}: any) => 
                        inline 
                            ? <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />
                            : <code className="block bg-gray-100 p-4 rounded mb-4" {...props} />,
                    table: ({node, ...props}) => <table className="table-auto border-collapse border border-gray-300 mb-4 w-full" {...props} />,
                    thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
                    tbody: ({node, ...props}) => <tbody {...props} />,
                    tr: ({node, ...props}) => <tr className="border-b border-gray-300" {...props} />,
                    th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 text-left font-bold" {...props} />,
                    td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                    img: ({node, ...props}) => (
                        <div className="w-full flex justify-center my-4">
                            <img
                                {...props}
                                alt={props.alt || "image"}
                                className="
                                    w-full          /* default: mobile = 100% width */
                                    md:w-1/2        /* medium+ screens = 50% width */
                                    h-auto 
                                    rounded-lg
                                "
                            />
                        </div>
                    ),

                }}
            >
                {content}
            </ReactMarkdown>
        </div>
        </div>
    </div>
  );
}
