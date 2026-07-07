"use client";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState, useRef } from "react";
import { getAccessToken } from "../../../../../functions/abhiPcCalls";
import { useCollectionStore } from "../../../../../hooks/useCollectionsStore";

type ModalType = "upload" | "clear" | null;

export default function Page() {
    const [photos, setPhotos] = useState<File[]>([]);
    const [totalFileSize, setTotalFileSize] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [path, setPath] = useState("");
    const [modal, setModal] = useState<ModalType>(null);
    const { collections, fetchCollections } = useCollectionStore();

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        setTotalFileSize(photos.reduce((sum, currFile) => sum + currFile.size, 0));
    }, [photos]);

    const handleUpload = async () => {
        setModal(null);
        setLoading(true);
        if (path !== "") {
            const { access_token } = await getAccessToken();
            const formData = new FormData();
            photos.forEach((photo) => formData.append("files", photo));

            let modPath = path !== "iphone_photos" ? "trips/" + path : path;
            formData.append("path", modPath);

            const res = await fetch("https://home.sriabhi.com/api/v1/photo/upload_photos", {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${access_token}` },
                credentials: "include",
            });

            await res.json();
            setSuccessMessage(`Photos uploaded successfully!`);
            setPhotos([]);
        } else {
            alert("Add a path");
        }
        setLoading(false);
    };

    const handleClear = () => {
        setModal(null);
        setPhotos([]);
        setSuccessMessage("");
    };

    const pathOptions = [
        "iphone_photos",
        ...collections.map(c => c.grabPath.split("/")[1])
    ];

    return (
        <div className="flex min-h-screen p-3 bg-[#F3F1ED] flex-col">
            <Navbar />

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-80 shadow-xl flex flex-col gap-4">
                        <h2 className="text-xl font-serif-custom font-black text-black">
                            {modal === "upload" ? "Upload photos?" : "Clear selection?"}
                        </h2>
                        <p className="text-black text-sm">
                            {modal === "upload"
                                ? `You're about to upload ${photos.length} photo${photos.length !== 1 ? "s" : ""} to "${path}".`
                                : `This will remove all ${photos.length} selected photo${photos.length !== 1 ? "s" : ""}.`
                            }
                        </p>
                        <div className="flex gap-2">
                            <button
                                className="flex-1 p-2 rounded-md border border-gray-300 text-black hover:bg-gray-100"
                                onClick={() => setModal(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 p-2 rounded-md bg-[#74A662] hover:bg-[#4D7C56] text-white"
                                onClick={modal === "upload" ? handleUpload : handleClear}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="items-start mb-2 lg:mt-10 mt-12">
                <div className="flex w-full justify-between">
                    <h1 className="text-3xl font-serif-custom font-black text-black">Upload Photos</h1>
                </div>
            </div>
            <div className="flex flex-1">
                <div className="w-3/4 flex p-2 flex-col" onClick={() => fileInputRef.current?.click()}>
                    <h1 className="text-md text-black">
                        {photos.length === 0 ? "Click anywhere to select" : `${photos.length} ${photos.length === 1 ? "photo selected" : "photos selected"}`}
                    </h1>
                    <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2">
                        {photos.map((file, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="max-h-70 object-contain rounded-lg"
                                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                            />
                        ))}
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => { if (e.target.files) setPhotos(Array.from(e.target.files)); }}
                    />
                </div>
                <div className="bg-gray-200 w-1/4 flex flex-col rounded-md p-2 min-h-44">
                    <h1 className="text-2xl font-serif-custom font-black text-black">Menu</h1>
                    <h1 className="text-md text-black">Choose collection</h1>
                    <input
                        type="text"
                        placeholder="Create a new collection here"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        className="w-full p-2 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                    />
                    <div className="flex flex-wrap gap-x-2 gap-y-2 items-center justify-center">
                        {pathOptions.map((item, index) => (
                            <div
                                className={`min-h-10 min-w-40 ${path === item ? "bg-[#4D7C56]" : "bg-[#74A662]"} rounded-lg flex items-center justify-center hover:cursor-pointer`}
                                key={index}
                                onClick={() => setPath(path === item ? "" : item)}
                            >
                                <p className="text-white">{item}</p>
                            </div>
                        ))}
                    </div>
                    {successMessage !== "" && (
                        <p className="text-green-600 text-md mt-auto mb-2">{successMessage}</p>
                    )}
                    <div className="mt-auto">
                        <button
                            className="bg-transparent text-black hover:text-white w-full p-2 rounded-md flex items-center justify-center hover:cursor-pointer border border-[#4D7C56] hover:bg-[#4D7C56] mb-2 disabled:opacity-50"
                            onClick={() => setModal("clear")}
                            disabled={loading || photos.length === 0}
                        >
                            Clear
                        </button>
                        <button
                            className="bg-[#74A662] w-full p-2 rounded-md flex items-center justify-center hover:cursor-pointer hover:bg-[#4D7C56] disabled:bg-gray-500 disabled:cursor-not-allowed"
                            onClick={() => setModal("upload")}
                            disabled={loading || photos.length === 0}
                        >
                            {loading ? "Uploading..." : "Send to server"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}