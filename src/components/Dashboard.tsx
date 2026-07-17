"use client";
import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Heart, Images, Notebook, PiggyBank, Send } from "lucide-react";
import Link from "next/link";

interface DashboardProps { token: string; }
interface SelectedAction {
  title: string; subtitle: string;
  icon: () => React.JSX.Element; options: Option[];
}
interface Option { action: string; path: string; }
interface Message { role: "user" | "assistant"; content: string; }

export default function Dashboard({ token }: DashboardProps) {
  const [query, setQuery] = useState("");
  const [greeting, setGreeting] = useState("");
  const [selectedAction, setSelectedAction] = useState<SelectedAction>();
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greetings = [
    "What are we doing today?", "Welcome back, Abhi.", "Ready when you are, Abhi.",
    "Your blank canvas for anything Abhi.", "Kachow!", "Despite everything, it's still you!",
    "Joy has a strange habit of returning, Abhi.", "Someday, you're going to be somebody.",
    "Stand burning, Abhi.", "Reach for the moon and land amongst the stars.",
    "Smoother waters ahead, Abhi.",
  ];

  const actions = [
    { title: "Money", subtitle: "What's in YOUR wallet?", icon: () => <PiggyBank size={30} color="green" />, options: [{ action: "Check finance dashboard", path: "/internal/finance_tools" }] },
    { title: "Blog", subtitle: "Mess with the blog", icon: () => <Notebook size={30} color="#3F88C5" />, options: [{ action: "Create blog post", path: "/internal/blog_tools/create_blog_post" }, { action: "Edit existing posts", path: "/internal/blog_tools" }] },
    { title: "Photos", subtitle: "Tweak collections", icon: () => <Images size={30} color="#EECF6D" />, options: [{ action: "Upload photos", path: "/internal/photo_tools/upload_photos" }, { action: "Edit collections", path: "/internal/photo_tools" }] },
    { title: "Exercise", subtitle: "Run, swim, climb, see it all", icon: () => <Heart size={30} color="#D00000" />, options: [{ action: "Check health dashboard", path: "/internal/health_tools" }, { action: "Upload new health data", path: "/internal/health_tools/upload_workout" }] },
  ] as SelectedAction[];

  useEffect(() => { setGreeting(greetings[Math.floor(Math.random() * greetings.length)]); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const enterChat = () => {
    if (!query.trim()) return;
    setChatMode(true);
    setMessages([{ role: "user", content: query }]);
    setQuery("");
    setLoading(true);

    // this is where you'd normally call your backend with the query and update messages with the response. For demo, we'll just echo the query after 1 second.
    setTimeout(() => {
        setMessages(prev => [...prev, { role: "assistant", content: `Echo: ${query}` }]);
        setLoading(false);
    }, 1000);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: `Echo: ${msg}` }]);
      setLoading(false);
    }, 200);
  };

  const exitChat = () => {
    setChatMode(false);
    setMessages([]);
    setChatInput("");
  };

  if (chatMode) {
    return (
      <div className="h-screen bg-[#F4F2F3] flex flex-col items-center">
        <Navbar />
        <div className="w-full lg:w-1/2 px-2 flex flex-col flex-1 min-h-0 pt-20">
          {/* Messages */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-black text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-black rounded-bl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-xl rounded-bl-none bg-white border border-gray-200 flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 py-3">
            <button onClick={exitChat} className="p-2 rounded-lg border border-black hover:bg-gray-100 transition-colors flex-shrink-0">
              <ArrowLeft size={16} className="text-black" />
            </button>
            <input
              autoFocus
              placeholder="Message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="border border-black p-2 text-black rounded-lg flex-1 text-sm bg-[#F4F2F3]"
            />
            <button onClick={sendMessage} className="p-2 rounded-lg border border-black hover:bg-gray-100 transition-colors flex-shrink-0">
              <Send size={16} className="text-black" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F4F2F3] flex flex-col items-center overflow-hidden">
      <Navbar />
      <div className="w-full lg:w-1/2 px-2 flex flex-col flex-1 justify-center min-h-0">

        {/* Greeting */}
        <h1 className="text-black text-4xl font-serif-custom text-center mb-4">{greeting}</h1>

        {/* Input */}
        <input
          placeholder="Search anything"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enterChat()}
          className="border border-black p-2 text-black rounded-lg w-full text-sm bg-[#F4F2F3]"
        />

        {/* Action buttons */}
        <div className="mt-4">
          <h1 className="text-black text-md">Quick actions</h1>
          <div className="grid grid-cols-2 gap-2 mt-2 sm:flex sm:gap-x-2">
            {actions.map((item, index) => (
              <div
                key={index}
                className={`min-h-28 w-full sm:w-60 border border-black p-2 bg-[#F4F2F3] rounded-md hover:cursor-pointer ${selectedAction === item ? "bg-gray-500" : ""}`}
                onClick={() => setSelectedAction(item)}
              >
                <div className="mb-1">{item.icon()}</div>
                <h1 className="text-black text-xl font-serif-custom">{item.title}</h1>
                <p className="text-black text-xs">{item.subtitle}</p>
              </div>
            ))}
          </div>
          {selectedAction && (
            <div className="mt-5">
              <h1 className="text-black text-2xl font-serif-custom">Actions For {selectedAction.title}</h1>
              {selectedAction.options.map((opt, i) => (
                <div key={i}>
                  <Link href={opt.path} className={`text-black text-sm ${i === 0 ? "mt-2" : ""}`}>{opt.action}</Link>
                  {i !== selectedAction.options.length - 1 && <div className="border border-gray-200 w-full my-2" />}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}