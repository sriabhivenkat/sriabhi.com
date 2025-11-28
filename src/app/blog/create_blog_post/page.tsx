"use client";
import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { getAccessToken } from "../../../../functions/abhiPcCalls";

export default function Page() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);


  const handleSubmit = async () => {
    if (!title || !content) {
      alert("Please provide both a title and content.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const formData = new FormData();

      // Convert markdown content to a Blob
      const markdownBlob = new Blob([content], { type: "text/markdown" });
      const filename = title.replace(/\s+/g, "_") + ".md";
      formData.append("files", markdownBlob, filename);

      // Add cover photo if selected
      if (coverPhoto) {
        formData.append("cover_photo", coverPhoto, coverPhoto.name);
      }

      // Metadata
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("tags", selectedTag);
      formData.append("word_count", content.trim().split(/\s+/).length.toString());
      formData.append("path", "blog");

      const { access_token } = await getAccessToken();

      const res = await fetch("https://home.sriabhi.com/api/v1/upload_files", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Blog uploaded successfully!`);
        setTitle("");
        setSubtitle("");
        setContent("");
        setSelectedTag("");
        setCoverPhoto(null);
      } else {
        alert(data.error || "Failed to upload blog.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload blog.");
    }

    setLoading(false);
  };

    const [readingTime, setReadingTime] = useState(0);
    const lastLengthRef = useRef(0);

useEffect(() => {
    const calculateReadingTime = (text: string, wpm = 200): number => {
        if (!text.trim()) return 0;
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / wpm);
    };

    const currentLength = content.length;
    if (Math.abs(currentLength - lastLengthRef.current) >= 200) {
        const minutes = calculateReadingTime(content);
        setReadingTime(minutes);
        lastLengthRef.current = currentLength;
    }
    }, [content]);

    console.log(content)
  const tags = [
    {
        title: "Personal",
        tag: "personal"
    },
    {
        title: "Guide",
        tag: "guide"
    },
    {
        title: "Miscellaneous",
        tag: "misc"
    }
  ]
  return (
    <div className="min-h-screen flex flex-col p-5 mt-15 lg:mt-10 overflow-hidden bg-[#F4F2F3]">
      <div className="w-full flex flex-col ">
        <div className="flex flex-col items-start justify-center mb-4">
          <h1 className="text-3xl font-serif-custom font-black text-black">
            Create Blog Post
          </h1>
        </div>
      </div>

      <div className="w-full flex gap-4 flex-1">
        {/* Markdown editor */}
        <div className="w-1/2 flex flex-col">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
          <input
            type="text"
            placeholder="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full p-3 mb-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          />
          <input 
            type="file"
            accept="image/*"
            className="w-full p-3 mb-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setCoverPhoto(file);
                setCoverPhotoPreview(URL.createObjectURL(file));
              }
            }}
          />
          <div className="w-full mb-2 flex flex-col ml-1">
            <p className="mb-2 text-sm text-black">Tags</p>
            <div className="flex gap-x-2">
                {tags.map((tag, index) => (
                    <div 
                        key={index} 
                        className={`h-10 ${selectedTag === tag.tag ? "bg-gray-800" : "bg-gray-600"} rounded-lg p-3 flex items-center justify-center hover:cursor-pointer`} 
                        onClick={(e) => {
                            if (selectedTag === tag.tag) {
                                setSelectedTag("")
                            } else {
                                setSelectedTag(tag.tag)
                            }
                        }}>
                        <p className={`text-sm ${selectedTag === tag.tag ? "text-white" : "text-white"}`}>
                            {tag.title}
                        </p>
                    </div>
                ))}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog post in Markdown..."
            className="flex-1 p-3 text-black rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 max-h-[90vh] overflow-y-auto"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create post"}
          </button>
          {successMessage && (
            <p className="mt-2 text-green-600 font-medium">{successMessage}</p>
          )}
        </div>

        {/* Markdown preview */}
        <div className="w-1/2 p-5 border border-gray-300 rounded-lg bg-white max-h-[90vh] overflow-y-auto">
            {title || content ? (
                <div>
                    {title && (
                        <div className="mb-4 border-b-1 border-gray-400">
                            {coverPhotoPreview && (
                              <img
                                src={coverPhotoPreview}
                                className="w-full max-h-96 object-cover rounded-lg mb-4"
                                alt="Cover preview"
                              />
                            )}
                            <h1 className="text-4xl font-bold font-serif-custom text-black">{title}</h1>
                            <h3 className="text-lg font-serif-custom text-gray-600 mb-2">{subtitle}</h3>
                            <p className="font-serif-custom text-gray-600 mb-3">{new Date().toLocaleDateString()} ● {readingTime} min read</p>
                        </div>
                    )}
                    <div className="prose prose-lg max-w-none">
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
                                  <img 
                                    className="max-w-full max-h-96 rounded-lg my-4 mx-auto block" 
                                    {...props} 
                                    alt={props.alt || 'Image'}
                                  />
                                )

                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>

                </div>
            ) : (
                <p className="text-gray-400">Live preview will appear here...</p>
            )}
        </div>
      </div>
    </div>
  );
}
