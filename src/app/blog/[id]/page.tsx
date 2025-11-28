"use client";
import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getAccessToken } from "../../../../functions/abhiPcCalls";
import remarkGfm from 'remark-gfm'
import Image from "next/image";
import { Check, Copy } from "@deemlol/next-icons";
import CopyableCodeBlock from "@/components/CodeBlock";
import Navbar from "@/components/Navbar";

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
  const [loaded, setLoaded] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#F4F2F3] p-5 mt-15 lg:mt-10">
      <Navbar />
      <div className="flex flex-col items-center w-full max-w-4xl">
        <div className="w-full flex flex-col items-center mb-5">
            {post?.cover_photo && (
              <Image
                  src={post.cover_photo}
                  className={`w-full max-h-96 object-cover rounded-lg mb-4 bg-gray-300 ${!loaded && "animate-pulse"}`}
                  alt="Cover preview"
                  placeholder="blur"
                  blurDataURL={post.cover_photo}
                  width={600}
                  height={500}
                  onLoad={() => setLoaded(true)}
              />
            )}
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
        <div className="flex flex-col flex-1 mx-auto prose prose-lg text-black max-w-full overflow-x-hidden">
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
                    code: ({ node, inline, children, ...props }: any) => {
                      // Inline code → do nothing special
                      if (inline) {
                        return (
                          <code
                            className="bg-gray-100 px-1 py-0.5 rounded break-words"
                            {...props}
                          />
                        );
                      }

                      return <CopyableCodeBlock>{children}</CopyableCodeBlock>
                    },

                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative text-black underline decoration-2 underline-offset-2 
                                  hover:decoration-gray hover:decoration-4 
                                  inline-flex items-center justify-center gap-1 transition duration-300"
                      >
                        {props.children}

                        {/* External link icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 inline-block decoration-2 hover:decoration-4"   // bigger icon
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6h8m0 0v8m0-8L10 14m-4 4h12"
                          />
                        </svg>

                        {/* Bold white underline (on hover) */}
                        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent 
                                        group-hover:bg-white"></span>
                      </a>
                    ),

                    table: ({node, ...props}) => <table className="table-auto border-collapse border border-gray-300 mb-4 w-full" {...props} />,
                    thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
                    tbody: ({node, ...props}) => <tbody {...props} />,
                    tr: ({node, ...props}) => <tr className="border-b border-gray-300" {...props} />,
                    th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 text-left font-bold" {...props} />,
                    td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                    img: ({node, ...props}) => (
                        <Image
                          className="max-w-full max-h-96 rounded-lg my-4 mx-auto block" 
                          {...props}
                          height={400}
                          width={500}
                          placeholder="blur"
                          blurDataURL={props.src}
                          alt={'Image'}
                          src={props.src || ""}
                        />
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
