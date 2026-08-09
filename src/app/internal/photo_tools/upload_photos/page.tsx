"use client";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState, useRef } from "react";
import { getAccessToken } from "../../../../../functions/abhiPcCalls";
import { useCollectionStore } from "../../../../../hooks/useCollectionsStore";
import { UploadCloud, X, Sparkles, CheckCircle2 } from "lucide-react";
import DashNav from "@/components/DashNav";

type ModalType = "upload" | "clear" | null;

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
}

export default function Page() {
    const [photos, setPhotos] = useState<File[]>([]);
    const [totalFileSize, setTotalFileSize] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [path, setPath] = useState("");
    const [modal, setModal] = useState<ModalType>(null);
    const { collections, fetchCollections } = useCollectionStore();
    const [uploadedCount, setUploadedCount] = useState(0);

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        setTotalFileSize(photos.reduce((sum, currFile) => sum + currFile.size, 0));
    }, [photos]);

    const handleUpload = async () => {
        setModal(null);

        if (path === "") {
            alert("Add a path");
            return;
        }

        setLoading(true);
        setUploadedCount(0);
        setSuccessMessage("");

        const { access_token } = await getAccessToken();
        const modPath = path !== "iphone_photos" ? `trips/${path}` : path;

        try {
            for (let i = 0; i < photos.length; i++) {
                const formData = new FormData();
                formData.append("files", photos[i]);
                formData.append("path", modPath);

                const res = await fetch(
                    "https://home.sriabhi.com/api/v1/photo/upload_photos",
                    {
                        method: "POST",
                        body: formData,
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                        credentials: "include",
                    }
                );

                if (!res.ok) {
                    throw new Error(`Failed to upload ${photos[i].name}`);
                }

                await res.json();
                setUploadedCount(i + 1);
            }

            setSuccessMessage(`Successfully uploaded ${photos.length} photo${photos.length === 1 ? "" : "s"}!`);
            setPhotos([]);
        } catch (err) {
            console.error(err);
            alert("An error occurred while uploading.");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setModal(null);
        setPhotos([]);
        setSuccessMessage("");
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const pathOptions = [
        ...collections
            .map(c => c.grabPath.startsWith("trips/")
                ? c.grabPath.split("/")[1]
                : c.grabPath
            )
    ]

    const isExistingCollection = path !== "" && pathOptions.includes(path);

    return (
        <div className="flex min-h-screen p-3 sm:p-6 bg-[#F3F1ED] flex-col">
            <DashNav />

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4">
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
                                className="flex-1 p-2 rounded-lg border border-gray-300 text-black hover:bg-gray-100 transition-colors"
                                onClick={() => setModal(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`flex-1 p-2 rounded-lg text-white transition-colors ${
                                    modal === "upload"
                                        ? "bg-[#3D2B2E] hover:bg-[#6B4C51]"
                                        : "bg-red-500 hover:bg-red-600"
                                }`}
                                onClick={modal === "upload" ? handleUpload : handleClear}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="items-start mb-4 lg:mt-10 mt-12">
                <h1 className="text-3xl font-serif-custom font-black text-black">Upload Photos</h1>
                <p className="text-sm text-black/60 mt-1">
                    Add to an existing collection, or start a new one.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 flex-1">
                {/* Photo picker */}
                <div className="w-full lg:w-3/4 flex flex-col">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`rounded-2xl bg-white border-2 border-dashed p-6 cursor-pointer transition-colors ${
                            photos.length === 0
                                ? "border-gray-300 hover:border-[#3D2B2E] flex flex-col items-center justify-center text-center min-h-[280px]"
                                : "border-gray-200 hover:border-[#3D2B2E]"
                        }`}
                    >
                        {photos.length === 0 ? (
                            <>
                                <UploadCloud size={36} className="text-[#3D2B2E] mb-2" />
                                <p className="text-black font-medium">Click to select photos</p>
                                <p className="text-black/50 text-sm mt-1">or drag and drop</p>
                            </>
                        ) : (
                            <div className="flex items-baseline justify-between mb-3">
                                <p className="text-sm font-medium text-black">
                                    {photos.length} photo{photos.length === 1 ? "" : "s"} selected
                                </p>
                                <p className="text-xs text-black/50">
                                    {formatBytes(totalFileSize)} total
                                </p>
                            </div>
                        )}

                        {photos.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {photos.map((file, index) => {
                                    const url = URL.createObjectURL(file);
                                    return (
                                        <div
                                            key={index}
                                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <img
                                                src={url}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                                onLoad={() => URL.revokeObjectURL(url)}
                                            />
                                            <button
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => { if (e.target.files) setPhotos((prev) => [...prev, ...Array.from(e.target.files!)]); }}
                    />
                </div>

                {/* Menu */}
                <div className="w-full lg:w-1/4 flex flex-col rounded-2xl bg-white border border-neutral-200/70 shadow-sm p-4">
                    <h2 className="text-xl font-serif-custom font-black text-black mb-1">
                        Add to a collection
                    </h2>

                    {pathOptions.length > 0 && (
                        <>
                            <p className="text-xs font-medium uppercase tracking-wide text-black/40 mt-3 mb-1.5">
                                Existing collections
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {pathOptions.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setPath(path === item ? "" : item)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            path === item
                                                ? "bg-[#6B4C51] text-white"
                                                : "bg-white border border-gray-200 text-black hover:bg-gray-50"
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 my-3">
                                <div className="h-px flex-1 bg-gray-200" />
                                <span className="text-[10px] uppercase tracking-wide text-black/30">or</span>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>
                        </>
                    )}

                    <p className="text-xs font-medium uppercase tracking-wide text-black/40 mb-1.5">
                        New collection
                    </p>
                    <input
                        type="text"
                        placeholder="e.g. summer-trip-2026"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3D2B2E]/40 text-black text-sm"
                    />

                    {path !== "" && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs">
                            {isExistingCollection ? (
                                <>
                                    <CheckCircle2 size={14} className="text-[#6B4C51] shrink-0" />
                                    <span className="text-black/60">Adding to existing collection</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} className="text-amber-500 shrink-0" />
                                    <span className="text-black/60">This will create a new collection</span>
                                </>
                            )}
                        </div>
                    )}

                    {successMessage !== "" && (
                        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                            <p className="text-green-700 text-sm">{successMessage}</p>
                        </div>
                    )}

                    <div className="mt-auto pt-4">
                        {loading && (
                            <div className="w-full mb-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Uploading photos...</span>
                                    <span>{uploadedCount} / {photos.length}</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#3D2B2E] transition-all duration-200"
                                        style={{ width: `${photos.length > 0 ? (uploadedCount / photos.length) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        <button
                            className="bg-transparent text-black hover:text-white w-full p-2 rounded-lg flex items-center justify-center hover:cursor-pointer border border-[#6B4C51] hover:bg-[#6B4C51] mb-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={() => setModal("clear")}
                            disabled={loading || photos.length === 0}
                        >
                            Clear
                        </button>
                        <button
                            className="bg-[#3D2B2E] w-full p-2 rounded-lg flex items-center justify-center hover:cursor-pointer hover:bg-[#6B4C51] disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
                            onClick={() => setModal("upload")}
                            disabled={loading || photos.length === 0 || path === ""}
                        >
                            {loading ? "Uploading..." : "Send to server"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}