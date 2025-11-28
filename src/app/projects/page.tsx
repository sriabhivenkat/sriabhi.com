"use client"
import React, { useEffect, useState } from 'react';
import PokeballReveal from '@/components/PokeballReveal';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

export default function Page() {
    const containerInfo = {
        "default": {
            "title": "My Home Lab Server",
            "description": "Instead of using my PC to game, I've binded my PC's public IP to sriabhi.com, allowing me to set up a one stop shop for all things Abhi. From photo storage to financial analysis, sriabhi.com is the central repository for everything I enjoy doing. Click on individual Pokéballs to read more about the 6 microservices that make up sriabhi.com"
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
            title: "Streamlining Form Submissions with Garchomp",
            description: "Creating scalable MCP servers and flexible LLM clients to automate ticket inquiry and submission for JP Morgan Wealth Management",
            photoUrl: "/images/garchomp.png",
            date: "2025"
        },
        {
            title: "Filling in the gaps with AI generated photos at Walmart Global Tech",
            description: "How I used pixel density heatmaps to autolabel AI generated photos, cleaning up datasets with holes",
            photoUrl: "/images/wdc.png",
            date: "2023"
        },
        {   
            title: "Pixlist",
            description: "An app I built to authentically involved with the minutiae of my friends' life",
            photoUrl: "/images/pixlist.png",
            date: "2022"
        },
        {
            title: "What does ultra-specific messaging look like at scale?",
            description: "A team and I deep dive into finding the perfect balance between Slack, Remind, WhatsApp and Canvas for The Reach Project.",
            photoUrl: "/images/reachproject.png",
            date: "2021-2022"
        },
        {
            title: "Bite Party",
            description: "A fun app groups of friends could use to find nearby restaurants they all wanted to eat using a Tinder-like swiping functionality!",
            photoUrl: "/images/bp.png",
            date: "2020-2021"
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
        <div className="min-h-screen flex flex-col p-3 bg-[#F4F2F3]">
            {/* Header */}
            <Navbar />
            <div className="mt-12 lg:mt-10 flex flex-col flex-1">
            <div className="flex flex-col items-start justify-center mb-5">
                <h1 className="text-5xl font-serif-custom font-black text-black">Projects</h1>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-col">
                <div className="
                    w-full lg:w-3/4 min-h-72 bg-[#F4F2F3] rounded-lg shadow-md border border-gray-200
                    grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 p-5 flex items-center self-center
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
                        <p className="text-gray-400 text-xs mb-1 font-bold">FEATURED | 2025</p>
                        <h1 className="text-2xl text-black font-serif-custom font-bold mb-1">sriabhi.com</h1>
                        <h2 className="text-lg text-black font-inter font-bold mb-1">{selectedContainer.title}</h2>
                        <div className="flex items-center max-h-16 max-w-28 p-1 rounded text-black text-sm border border-gray-400 mb-1">
                            <div className={`h-3 w-3 mr-1 rounded-full ${containerHealths[selectedHealth] === "running" ? "bg-green-600" : "bg-red-600"}`}/>
                            {containerHealths[selectedHealth] === "running" ? "HEALTHY" : "DOWN"}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedContainer.description}</p>
                    </div>
                </div>
                    <div className="flex flex-col items-center mt-10">
                        <div className='lg:w-3/4 space-y-2'>
                            {otherProjects.map((project, index) => (
                                <div className="p-1 flex flex-col lg:flex-row justify-center items-center space-x-4 hover:cursor-pointer" key={index}>
                                    <div className='lg:max-w-1/3 self-center'>
                                        <p className="text-gray-400 text-xs mb-1 font-bold">{project?.date}</p>
                                        <h1 className="text-black text-2xl font-serif-custom font-bold mb-1">{project.title}</h1>
                                        <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                                    </div>
                                    <Image 
                                        src={project.photoUrl}
                                        alt="alt-text"
                                        className='bg-cover lg:max-w-1/2 mt-2 rounded-md transform transition duration-400 ease-in-out hover:scale-105'
                                        width={400}
                                        height={500}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}