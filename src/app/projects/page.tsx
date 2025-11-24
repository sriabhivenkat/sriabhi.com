"use client"
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PokeballReveal from '@/components/PokeballReveal';

export default function Page() {
    const containerInfo = {
        "default": {
            "title": "My Homelab server!",
            "description": "I have 6 containers, named after my favorite Pokémon! Tap on any of them to learn more. There's a lot of cool things they all do. They manage my finances, store my photos, and store blog posts. I have a lot of plans for the server. I have 4 main domains: sriabhi.com, home.sriabhi.com, nova.sriabhi.com, and mc.sriabhi.com (my minecraft server!). I have a lot of cool ideas for the server. I wanted to build my own PlexAmp server to manage my music, and maybe add a basic scripting language that will let me mix my music, instead of haivng to learn any of the existing software."
        },
        "oshawott": {
            "title": "Oshawott",
            "description": "Oshawott is my main API. It is the centerpiece of my entire team! It handles calls from Lucario and Mewtwo to serve content from my PostgreSQL DB, as well as provides processing functions for Dragonite to use! It's written in Flask. It serves on home.sriabhi.com - check out https://home.sriabhi.com/healthcheck!"
        },
        "lucario": {
            "title": "Lucario",
            "description": "Lucario is my main frontend - the website you're looking at now! It's written in Next.js and Typescript! I chose Lucario because I wanted a name for an agile workhorse container, and that seems very Lucario-esque."
        },
        "snorlax": {
            "title": "Snorlax",
            "description": "Snorlax is the main entry point of my app! It uses Nginx for the reverse proxy setup and is where my main Docker bridge network is. I generate images of the other containers and Snorlax pulls them all on startup. I also use it to redirect from HTTP to HTTPS. I suppose I also do some amount of IP tracking and blocking, rate limiting, to ensure my team is safe! It's named Snorlax because he blocks the road hehe."
        },
        "dragonite": {
            "title": "Dragonite",
            "description": "Dragonite is my task scheduler and batch processor! It also takes care of my LangGraph workflows. I named him after the Dragonite Mailman from the anime. Dragonite currently runs 3 routes for me - the Sinnoh Route (grabs transactions every 12 hours), the Unova Route (updates my account balances every 6 hours), and the Hoenn Route (Langgraph - transaction analysis PDF generator). I have a few things down the pipeline for the Kanto Route - like asynchronous image processing and AWS Lambda-like triggers with my current file storage system."
        },
        "mewtwo": {
            "title": "Mewtwo",
            "description": "Mewtwo is where my LLMs are stored. I use Ollama and have currently pulled Gemma3 4B and LLaMa 4B as well! I can only run SLMs for now since I only have a NVIDIA RTX 3060. Please reach out to help me get a new GPU 🙏"
        },
        "gengar": {
            "title": "Gengar",
            "description": "Gengar is my PostgreSQL instance! It currently stores information about my account balances, transactions, merchants, photo URLs, blog post URLs, and cursors to track where I am in Plaid's transactions!",
        }
    }
    type ContainerKey = keyof typeof containerInfo;
    const [selectedContainer, setSelectedContainer] = useState(containerInfo["default"]);
    const [containerHealths, setContainerHealths] = useState<Record<string, string>>({});
    const [selectedHealth, setSelectedHealth] = useState("all");

    const otherProjects = [
        {
            title: "The REACH Project",
            description: "An app that crossed Slack, Canvas, and WhatsApp to create a central hub for a nonprofit that aimed to help people get access to benefits taken away from them by the state of Texas."
        },
        {   
            title: "Pixlist",
            description: "A fun photo sharing app that allowed for groups of friends to challenge each other to do fun dares and pass it on to another person in the app."
        },
        {   
            title: "Plaza",
            description: "A React webapp for researchers to get paid for the papers they published and those interested in reading papers to get easy and free access to research papers."
        },
        {
            title: "Bite Party",
            description: "A fun app groups of friends could use to find nearby restaurants they all wanted to eat using a Tinder-like swiping functionality!"
        }
    ]
    useEffect(() => {
        const fetchHealths = async () => {
            try {
                const res = await fetch("https://home.sriabhi.com/api/containers/health");
                const data = await res.json();

                let healthy = true;
                Object.entries(data).forEach(([name, status]) => {
                    if (!["abhi_batch_processor-dragonite-1", "bold_chaplygin", "buildx_buildkit_mybuilder0", "funny_germain", "torterra"].includes(name)) {
                        if (status !== "running") healthy = false;
                    }
                });

                const allHealths = {
                    oshawott: data["oshawott-main-api"],
                    dragonite: data["dragonite-batch-processor"],
                    gengar: data["gengar-postgres"],
                    lucario: data["lucario-frontend"],
                    mewtwo: data["mewtwo-deepseek-api"],
                    snorlax: data["snorlax-proxy-gateway"],
                    all: healthy ? "running" : "exited",
                };

                setContainerHealths(allHealths);
                setSelectedHealth("all");
            } catch (error) {
                console.error("Failed to fetch container health:", error);
            }
        };

        fetchHealths();
    }, []);

    // Handles click on a Pokeball with optional animation delay
    const handlePokeballClick = (key: ContainerKey) => {
        setSelectedContainer(containerInfo[key]);
        setSelectedHealth(key);
    };

    return (
        <div className="min-h-screen flex flex-col p-5 overflow-hidden bg-[#F4F2F3]">
            {/* Header */}
            <div className="flex flex-col items-start justify-center mb-5">
                <h1 className="text-6xl font-serif-custom font-black text-black">Projects</h1>
                <p className="mt-2 text-sm font-inter font-light text-black max-w-130">
                    i sorta try to build things that solve problems in my life, because i lead an extremely difficult life (sarcasm)
                </p>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-col">
                <div className="
                    w-full min-h-72 bg-[#F4F2F3] rounded-lg shadow-md border border-gray-200
                    grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 p-5 flex items-center
                ">
                    {/* LEFT: POKEMON GRID */}
                    <div className="
                        grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-2 
                        auto-rows-max gap-4 place-items-center
                    ">
                        {(Object.keys(containerInfo) as ContainerKey[])
                            .filter(k => k !== "default")
                            .map((key) => (
                                <PokeballReveal
                                    key={key}
                                    src={`https://img.pokemondb.net/sprites/black-white/anim/normal/${key}.gif`}
                                    onClick={() => handlePokeballClick(key)}
                                />
                        ))}
                    </div>

                    {/* RIGHT: Info section */}
                    <div className="p-4">
                        <h1 className="text-2xl text-black font-serif-custom font-bold mb-3">sriabhi.com</h1>
                        <h2 className="text-lg text-black font-inter font-bold mb-1">{selectedContainer.title}</h2>
                        <div className="flex items-center max-h-16 max-w-28 p-1 rounded text-black text-sm border border-gray-400 mb-1">
                            <div className={`h-3 w-3 mr-1 rounded-full ${containerHealths[selectedHealth] === "running" ? "bg-green-600" : "bg-red-600"}`}/>
                            {containerHealths[selectedHealth] === "running" ? "HEALTHY" : "DOWN"}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedContainer.description}</p>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row mt-5 space-x-1 space-y-2">
                    {otherProjects.map((project, index) => (
                        <div className='rounded-lg shadow-md border border-gray-200 p-5' key={index}>
                            <h1 className="text-black text-2xl font-serif-custom font-bold mb-3">{project.title}</h1>
                            <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <Navbar />
        </div>
    );
}