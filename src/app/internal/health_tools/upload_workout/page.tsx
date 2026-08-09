"use client";
import React, { useRef, useState } from "react";
import DashNav from "@/components/DashNav";
import { UploadCloud, FileArchive, FileCode } from "lucide-react";

interface UploadCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    acceptedExtensions: string[];
    accentColor: string;
}

function UploadCard({ title, description, icon, acceptedExtensions, accentColor }: UploadCardProps) {
    const [file, setFile] = useState<File>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    };
    return (
        <div className="rounded-2xl backdrop-blur-xl bg-white/40 border border-white/50
                    shadow-lg p-6 flex flex-col gap-4 w-full max-w-md"
        >
            <div className="flex items-center gap-2">
                <span style={{ color: accentColor }}>{icon}</span>
                <h3 className="font-serif-custom text-lg text-[#3D2B2E]">{title}</h3>
            </div>
            <p className="text-sm text-[#6B4C51]">{description}</p>

            {/* Dropzone */}
            <>
                <div 
                    className="relative rounded-xl border-2 border-dashed border-[#3D2B2E]/25 flex flex-col items-center justify-center gap-2 py-10 px-4 text-center hover:cursor-pointer" 
                    onClick={() => fileInputRef.current?.click()}
                > 
                    <UploadCloud size={28} className="text-[#6B4C51]" /> 
                    <p className="text-sm text-[#3D2B2E] font-medium"> Drag & drop your file here </p> 
                    <p className="text-xs text-[#6B4C51]"> or click to browse ({acceptedExtensions.join(", ")}) </p> 
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept={acceptedExtensions.join(",")} 
                    onChange={handleFileChange} 
                />
            </>

            {/* Selected file preview — static placeholder */}
            {file &&
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/60 border border-white/50">
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm text-[#3D2B2E] font-medium truncate">
                            {file.name}
                        </span>
                        <span className="text-xs text-[#6B4C51]">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                    </div>
                    <button 
                        className="text-xs text-[#6B4C51] hover:text-[#3D2B2E] hover:cursor-pointer underline shrink-0 ml-2"
                        onClick={() => setFile(undefined)}
                    >
                        Remove
                    </button>
                </div>
            }

            <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    bg-[#3D2B2E] text-[#F4F2F3] hover:bg-[#6B4C51] transition-colors"
            >
                Upload
            </button>
        </div>
    );
}

export default function UploadWorkout() {
    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden
                 bg-[#F4F2F3]
                 flex flex-col items-center p-2"
        >
            <DashNav />
            <div className="mt-12 flex flex-col items-center gap-2 text-center px-4">
                <h1 className="font-serif-custom text-2xl text-[#3D2B2E]">Import Workout Data</h1>
                <p className="text-sm text-[#6B4C51] max-w-md">
                    Upload your Strava bulk export or Apple Health data export to bring your activity history into Bookkeeper.
                </p>
            </div>

            <div className="mt-8 flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center flex-wrap px-4 pb-8">
                <UploadCard
                    title="Strava Bulk Export"
                    description="Upload the activities.csv or the full export archive from your Strava bulk download."
                    icon={<FileArchive size={20} />}
                    acceptedExtensions={["csv", "zip"]}
                    accentColor="#FC5200"
                />

                <UploadCard
                    title="Apple Health Export"
                    description="Upload the export.zip (or export.xml) from Health app → Export All Health Data."
                    icon={<FileCode size={20} />}
                    acceptedExtensions={["xml", "zip"]}
                    accentColor="#3D2B2E"
                />
            </div>
        </div>
    );
}