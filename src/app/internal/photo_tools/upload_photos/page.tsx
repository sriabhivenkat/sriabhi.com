"use client";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState, useRef } from "react";
import { Upload } from "lucide-react";
import Image from "next/image";
import { getAccessToken } from "../../../../../functions/abhiPcCalls";

export default function Page() {
    const [photos, setPhotos] = useState<File[]>([]);
    const [totalFileSize, setTotalFileSize] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [path, setPath] = useState("");

    useEffect(() => { 
        setTotalFileSize(photos.reduce((sum, currFile) => {
            return sum + currFile.size
        }, 0));
    }, [photos])
    const PATH_NAMES = [
        "iphone_photos",
        "banff",
        "dallas",
        "nyc",
        "japan",
        "yosemite",
        "alaska",
        "rainier",
        "austin",
        "nola",
        "cold_springs",
        "oklahoma",
        "new_mexico"
    ]

    const handleUpload = async() => {
        setLoading(true);
        if (path !== "") {
            const { access_token } = await getAccessToken();
            const formData = new FormData();
            photos.forEach((photo) => {
                formData.append("files", photo); // same key for multiple files
            });
            let modPath = ""
            if (path !== "iphone_photos") {
                modPath = "trips/" + path
            } else {
                modPath = path
            }
            formData.append("path", modPath)

            const res = await fetch("https://home.sriabhi.com/api/v1/photo/upload_photos", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                credentials: "include",
            })

            const data = await res.json();
            setSuccessMessage(`Photos uploaded successfully!`);
        } else {
            alert("Add a path")
        }
        setLoading(false);
    }
    return(
        <div className="flex min-h-screen p-3 bg-[#F4F2F3] flex-col">
            <Navbar />
            <div className="items-start mb-2 lg:mt-10 mt-12">
                <div className="flex w-full justify-between">
                    <h1 className="text-3xl font-serif-custom font-black text-black">Upload Photos</h1>
                </div>
            </div>
            <div className="flex flex-1">
                <div className="w-3/4 flex p-2 flex-col"
                    onClick={() => {
                        fileInputRef.current?.click()
                    }}
                >
                     <h1
                        className="text-md text-black"
                    >
                        {photos.length === 0 ? "Click anywhere to select" : `${photos.length} ${photos.length === 1 ? "photo selected" : "photos selected"}`}
                    </h1>
                    <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2">
                        {photos.map((file, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="max-h-70 object-contain rounded-lg"
                                onLoad={(e) => {
                                    // free up memory after image is loaded
                                    URL.revokeObjectURL((e.target as HTMLImageElement).src)
                                }}
                            />
                        ))}
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files) {
                                setPhotos(Array.from(e.target.files))
                            }
                        }}
                    />
                </div>
                <div className="bg-gray-200 w-1/4 flex flex-col rounded-md p-2 min-h-44">
                    <h1
                        className="text-xl font-serif-custom font-black text-black"
                    >
                        Menu
                    </h1>

                    <h1
                        className="text-md text-black"
                    >
                        Choose collection
                    </h1>
                    <input
                        type="text"
                        placeholder="Create a new collection here"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        className="w-full p-2 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                    />
                    <div
                        className="flex flex-wrap gap-x-2 gap-y-2 items-center justify-center"
                    >
                        {PATH_NAMES.map((item, index) => (
                            <div 
                                className={`min-h-10 min-w-40 ${path === item ? "bg-gray-500" : "bg-gray-400"} rounded-lg flex items-center justify-center hover:cursor-pointer`}
                                key={index}
                                onClick={() => {
                                    if (path === item) {
                                        setPath("")
                                    } else {
                                        setPath(item)
                                    }
                                }}
                            >
                                <p className="text-white">{item}</p>
                            </div>
                        ))}
                    </div>
                    {successMessage !== "" &&
                        <p className="text-green-600 text-md mt-auto mb-2">
                            {successMessage}
                        </p>
                    }
                    <button
                        className="bg-blue-500 w-full p-2 rounded-md flex items-center justify-center hover:cursor-pointer"
                        onClick={handleUpload}
                    >
                       {loading ? "Uploading" : "Send to server"}
                    </button>
                </div>
            </div>
        </div>
    )
}