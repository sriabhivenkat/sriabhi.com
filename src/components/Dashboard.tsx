"use client";
import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, BookImage, ClipboardClock, FolderUp, GitCommitVertical, GitPullRequestArrow, Heart, Images, ImageUp, ImageUpscale, LayoutDashboard, Notebook, PiggyBank, Receipt, Send, SquareActivity, Users } from "lucide-react";
import Link from "next/link";
import DashNav from "./DashNav";

interface DashboardProps { token: string; }
interface SelectedAction {
  title: string; subtitle: string;
  icon: () => React.JSX.Element; options: Option[];
}
interface Option { action: string; path: string; icon?: () => React.JSX.Element }
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
    "Welcome back, Abhi.", "Ready when you are, Abhi.",
    "Your blank canvas for anything Abhi.", "Kachow!", "Despite everything, it's still you!",
    "Joy has a strange habit of returning, Abhi.", "Someday, you're going to be somebody.",
    "Stand burning, Abhi.", "Ad astra per aspera",
    "You owe yourself the difficulty, Abhi.",
    "You go on, because it is the hard thing to do."
  ];

  const actions = [
    { title: "Money", subtitle: "What's in YOUR wallet?", icon: () => <PiggyBank size={30} color="green" />, 
      options: [
        { action: "Check Finance Dashboard", path: "/internal/finance_tools", icon: () => <LayoutDashboard size={30} color="green" />},
        { action: "Accounts", path: "/internal/finance_tools/accounts", icon: () => <PiggyBank size={30} color="green" />},
        { action: "Transactions", path: "/internal/finance_tools/transactions", icon: () => <Receipt size={30} color="green" />},
        { action: "Reports", path: "/internal/finance_tools/reports", icon: () => <ClipboardClock size={30} color="green" />}
      ] 
    },
    { title: "Blog", subtitle: "Mess with the blog", icon: () => <Notebook size={30} color="#3F88C5" />, 
      options: [
        { action: "Create blog post", path: "/internal/blog_tools/create_blog_post", 
          icon: () => <GitCommitVertical size={30} color="#3F88C5"/> }, 
        { action: "Edit existing posts", path: "/internal/blog_tools",
          icon: () => <GitPullRequestArrow size={30} color="#3F88C5"/>
        }, 
        { action: "Commenter Access", path: "/internal/blog_tools/commenters",
          icon: () => <Users size={30} color="#3F88C5"/>
        }] 
    },
    { title: "Photos", subtitle: "Tweak collections", icon: () => <Images size={30} color="#EECF6D" />, 
      options: [
        { action: "Upload photos", path: "/internal/photo_tools/upload_photos", icon: () => <ImageUp size={30} color="#EECF6D"/>}, 
        { action: "Edit collections", path: "/internal/photo_tools", icon: () => <BookImage size={30} color="#EECF6D"/>},
        { action: "Edit photos", path: "/internal/photo_tools/edit_photos", icon: () => <ImageUpscale size={30} color="#EECF6D"/>}
      ] 
    },
    { title: "Exercise", subtitle: "Wattage data", 
      icon: () => <Heart size={30} color="#D00000" />, 
      options: [
        { action: "Check health dashboard", path: "/internal/health_tools", icon: () => <SquareActivity size={30} color="#D00000" />}, 
        { action: "Upload new health data", path: "/internal/health_tools/upload_workout", icon: () => <FolderUp size={30} color="#D00000" /> }] },
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
      <DashNav />
      <div className="w-full lg:w-1/2 px-2 flex flex-col flex-1 justify-center min-h-0">

        {/* Greeting */}
        <div className="flex justify-center mb-2">
          <div className="inline-block">
            <h1 className="text-black text-4xl sm:text-5xl font-serif-custom text-center mb-4">{greeting}</h1>
          </div>
        </div>

        {/* Input */}
        <input
          placeholder="Search anything"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enterChat()}
          className="border border-gray-300 p-2 text-black rounded-lg w-full text-sm bg-[#F4F2F3]"
        />

        {/* Action buttons */}
        <div className="mt-4">
          <h1 className="text-black text-md">Quick actions</h1>
          <div className="grid grid-cols-2 gap-2 mt-2 sm:flex sm:gap-x-2">
            {actions.map((item, index) => {
              const isSelected = selectedAction === item;
              return (
                <div
                  key={index}
                  className={`min-h-28 w-full sm:w-60 p-3 rounded-xl hover:cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#3D2B2E]/5 border border-[#3D2B2E]/40 ring-1 ring-[#3D2B2E]/20"
                      : "bg-[#F4F2F3] border border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedAction(item)}
                >
                  <div className="mb-1">{item.icon()}</div>
                  <h1 className="text-black text-xl font-serif-custom">{item.title}</h1>
                  <p className="text-black text-xs">{item.subtitle}</p>
                </div>
              );
            })}
          </div>

          {selectedAction && (
            <div className="mt-5 w-full">
              <h1 className="text-black text-2xl font-serif-custom mb-2">
                Actions
              </h1>
              <div className="flex flex-row flex-wrap gap-1 w-full">
                {selectedAction.options.map((opt, i) => (
                  <Link
                    key={i}
                    href={opt.path}
                    className="flex flex-1 items-center justify-center gap-x-2 text-black text-sm px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 transition-colors"
                  >
                    {opt?.icon && opt.icon()}
                    {opt.action}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}