"use client";
import React, {useEffect, useState} from "react";
import Navbar from "@/components/Navbar";
import {Heart, Images, Notebook, PiggyBank } from "lucide-react";
import Link from "next/link";

interface DashboardProps {
  token: string;
}

interface SelectedAction {
    title: string;
    subtitle: string;
    icon: () => React.JSX.Element,
    options: Option[]
}

interface Option {
    action: string;
    path: string;
}

export default function Dashboard({ token }: DashboardProps) {
    const [query, setQuery] = useState<string>("");
    const [greeting, setGreeting] = useState<string>("");
    const [selectedAction, setSelectedAction] = useState<SelectedAction>();
    const greetings = [
        "What are we doing today?",
        "Welcome back, Abhi.",
        "Ready when you are, Abhi.",
        "Your blank canvas for anything Abhi.",
        "Kachow!",
        "Despite everything, it's still you!",
        "Joy has a strange habit of returning, Abhi.",
        "Someday, you're going to be somebody.",
        "Stand burning, Abhi.",
        "Reach for the moon and land amongst the stars.",
        "Smoother waters ahead, Abhi."
    ]
    const actions = [
        {
            "title": "Money",
            "subtitle": "What's in YOUR wallet?",
            "icon": () => <PiggyBank size={30} color="green"/>,
            "options": [
                {
                    "action": "Check finance dashboard",
                    "path": "/internal/finance_tools"
                }
            ]
        },
        {
            "title": "Blog",
            "subtitle": "Mess with the blog",
            "icon": () => <Notebook size={30} color="#3F88C5"/>,
            "options": [
                {
                    "action": "Create blog post",
                    "path": "/internal/blog_tools/create_blog_post"
                },
                {
                    "action": "Edit existing posts",
                    "path": "/internal/blog_tools"
                }
            ]
        },
        {
            "title": "Photos",
            "subtitle": "Tweak collections",
            "icon": () => <Images size={30} color="#EECF6D"/>,
            "options": [
                {
                    "action": "Upload photos",
                    "path": "/internal/photo_tools/upload_photos"
                },
                {
                    "action": "Edit collections",
                    "path": "/internal/photo_tools"
                }
            ]
        },
        {
            "title": "Exercise",
            "subtitle": "Run, swim, climb, see it all",
            "icon": () => <Heart size={30} color="#D00000"/>,
            "options": [
                {
                    "action": "Check health dashboard",
                    "path": "/internal/health_tools"
                }
            ]
        },
    ] as SelectedAction[]
    useEffect(( ) => {setGreeting(greetings[Math.floor(Math.random() * greetings.length)])}, [])
    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden
                 bg-[#F4F2F3]
                 flex flex-col justify-center items-center p-2"
        >
            <Navbar />
            <div className="flex flex-col h-full w-full justify-center">
                <div className="w-full lg:w-1/2 items-center self-center">
                    <h1 className="text-black text-4xl font-serif-custom text-center">
                        {greeting}
                    </h1>
                    <input
                        placeholder="Search anything"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border border-black p-2 text-black rounded-lg mt-4 w-full"
                    />
                </div>
                <div className="mt-2 w-full lg:w-1/2 self-center">
                    <h1 className="text-black text-md">
                        Quick actions
                    </h1>
                    <div className="flex mt-2 gap-x-2">
                        {actions.map((item, index) => (
                            <div
                                key={index}
                                className={`min-h-28 w-60 border border-black p-2 bg-[#F4F2F3] rounded-md hover:cursor-pointer ${selectedAction === item && "bg-gray-500"}`}
                                onClick={() => setSelectedAction(item)}
                            >
                                <div className="mb-1">
                                    {item.icon()}  
                                </div>
                                <h1 className="text-black text-xl font-serif-custom">{item.title}</h1>
                                <p className="text-black text-xs">{item.subtitle}</p>
                            </div>
                        ))}
                    </div>
                    {selectedAction && (
                        <div>
                            <h1 className="text-black text-2xl font-serif-custom mt-5">
                                Actions For {selectedAction.title}
                            </h1>
                            {selectedAction.options.map((opt, i: number) => (
                                <div className="" key={i}>
                                    <Link key={i} href={opt.path} className={`text-black text-sm ${i == 0 && "mt-2"}`}>{opt.action}</Link>
                                    {i !== selectedAction.options.length-1 && (
                                        <div className="border border-gray-200 w-full my-2"/>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col mt-2 gap-y-2">

                    </div>
                </div>
            </div>
        </div>
    );
}
