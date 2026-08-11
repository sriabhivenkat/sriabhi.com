"use client"
import React, { useEffect, useState } from 'react';
import PokeballReveal from '@/components/PokeballReveal';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { Post } from '../blog/page';
import Link from 'next/link';

interface Container {
    title: string;
    description: string;
    main_language?: string;
    techs?: string[];
    tasks?: string[];
}
export default function Page() {
    const containerInfo = {
        "default": {
            "title": "My Home Lab Server",
            "description": "Instead of using my PC to game, I've binded my PC's public IP to sriabhi.com, allowing me to set up a one stop shop for all things Abhi. From photo storage to financial analysis, sriabhi.com is the central repository for everything I enjoy doing. Click on individual Pokéballs to read more about the 6 microservices that make up sriabhi.com"
        },
        "oshawott": {
            "title": "Oshawott",
            "description": "Oshawott is my main API, in charge of basic CRUD operations. I chose this name because I love Oshawott.",
            "main_language": "Python",
            "techs": [
                "Flask",
                "Graphene",
                "SQLAlchemy",
                "Plaid API",
                "Fitbit API"
            ],
            "tasks": [
                "Creating and editing blog posts",
                "Adding and updating photos",
                "GraphQL API for all transactions, current account balances, etc",
                "Internal Plaid endpoints for batch processing",
                "Internal Fitbit endpoints for ETL pipelining for my running data"
            ]
        },
        "lucario": {
            "title": "Lucario",
            "description": "Lucario is my main frontend - the website you're looking at now! I chose Lucario because it is an agile workhorse Pokémon.",
            "main_language": "TypeScript",
            "techs": [
                "Next.js"
            ],
            "tasks": [
                "Render all content performantly",
                "Onboard new accounts and financial institutions for later processing",
                "Earmark photos for agentic photo editing"
            ]
        },
        "snorlax": {
            "title": "Snorlax",
            "description": "Snorlax is the main entry point of my app! I chose this name because Snorlax famously blocks the road in the games.",
            "main_language": "NGINX Config files",
            "techs": [
                "NGINX"
            ],
            "tasks": [
                "Rate-limiting and load balancing",
                "SSL certifications",
                "General container management via a bridge network",
                "Port forwarding",
                "Request signing (required auth credentials and security headers)"
            ]
        },
        "dragonite": {
            "title": "Dragonite",
            "description": "Dragonite is my task scheduler and batch processor! I chose this name because the container's job is to converse with Plaid, Fitbit, and my MCP server to bring data back and forth, not unlike the Dragonite Mailman from the anime!",
            "main_language": "Python",
            "techs": [
                "CRONTab",
            ],
            "tasks": [
                "Update account balances every 24 hours",
                "Update transactions every 48 hours",
                "Asynchronous image processing via message queue",
                "LLM-based financial analysis",
                "Garbage collection for stale transactions older than a year"
            ]
        },
        "mewtwo": {
            "title": "Mewtwo",
            "description": "Mewtwo is where my LLMs and agentic workflows are stored. I chose this name because, in the movie, Mewtwo was grown in a lab to be a weapon, eventually wondering what it's purpose is - which feels like something an LLM would do with enough sentience.",
            "main_language": "Python",
            "techs": [
                "LangGraph",
                "FastMCP",
                "Flask",
                "Gemma3:4B"
            ],
            "tasks": [
                "Photo editing",
                "Transactions analysis"
            ]
        },
        "gengar": {
            "title": "Gengar",
            "description": "Gengar is my database! I named it that because in the games, Gengar is able to store away nearly infinite amounts.",
            "main_language": "SQL",
            "techs": [
                "PostgreSQL",
            ],
            "tasks": [
                "Stores photos, blog links, transactions, balances, etc."
            ]
        }
    }
    type ContainerKey = keyof typeof containerInfo;
    const [selectedContainer, setSelectedContainer] = useState<Container>(containerInfo["default"]);
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
    const [projects, setProjects] = useState<Post[]>([]);
      useEffect(() => {
        const main = async () => {
          const res = await fetch("/api/list-posts");
          const data: Post[] = await res.json();
    
          setProjects(
            data
              .map((p) => ({ ...p, date_created: new Date(p.date_created as any) }))
              .filter((p) => p.title !== "abhi_resume")
              .filter((p) => p.active && p.blog_type == 2)
              .sort((a, b) => +b.start_year! - +a.start_year!)
          );
        };
    
        main();
      }, []);

    // Handles click on a Pokeball with optional animation delay
    const handlePokeballClick = (key: ContainerKey) => {
        setSelectedContainer(containerInfo[key]);
        // setSelectedHealth(key);
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
                        {selectedContainer.techs &&
                            <div className='flex items-center justify-items-center gap-x-2'>
                                <p className='text-sm text-black font-light mr-2'>{selectedContainer.main_language}</p>
                                {selectedContainer.techs.map((item, index) => (
                                    <div 
                                        className="flex items-center max-h-16 min-w-20 p-1 rounded text-black text-sm border border-gray-400 mb-1 flex items-center justify-center"
                                        key={index}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        }
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedContainer.description}</p>
                        {selectedContainer.tasks && (
                            <div className='mt-5'>
                                <p className="text-md font-light text-black leading-relaxed">Tasks</p>
                                <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed">
                                    {selectedContainer.tasks.map((item, index) => (
                                        <li key={index}>
                                        {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                    </div>
                </div>
                    <div className="flex flex-col items-center mt-10">
                        <div className='lg:w-3/4 space-y-2'>
                            {projects.map((project, index) => (
                                <Link 
                                    className="p-1 flex flex-col lg:flex-row justify-center items-center space-x-4 hover:cursor-pointer" 
                                    key={index}
                                    href={`/blog/${project.id}`}
                                >
                                    <div className='lg:max-w-1/3 self-center'>
                                        <p className="text-gray-400 text-xs mb-1 font-bold">{project?.start_year} {project.end_year ? `- ${project.end_year}` : null}</p>
                                        <h1 className="text-black text-2xl font-serif-custom font-bold mb-1">{project.title}</h1>
                                        <p className="text-gray-600 text-sm leading-relaxed">{project.subtitle}</p>
                                    </div>
                                    <Image 
                                        src={project.cover_photo || ""}
                                        alt="alt-text"
                                        className='bg-cover lg:max-w-1/2 mt-2 rounded-md transform transition duration-400 ease-in-out hover:scale-105'
                                        width={400}
                                        height={500}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}