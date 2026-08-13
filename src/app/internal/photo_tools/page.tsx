"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashNav from "@/components/DashNav";
import Image from "next/image";
import PhotoRow from "@/components/PhotoRow";
import { Collection, useCollectionStore } from "../../../../hooks/useCollectionsStore";
import { usePhotoStore } from "../../../../hooks/usePhotoStore";
import { ArrowLeft, ChevronLeft, Lock, Plus, Trash2, Unlock } from "lucide-react";

type CollectionCard = Collection & { coverUrl: string | null; photoCount?: number; lastUpdated?: string | null };

export default function EditCollectionsPage() {
  const router = useRouter();
  const { collections, fetchCollections, updateCollection } = useCollectionStore();
  const { photoData, fetchFolder } = usePhotoStore();
  const [selectedGrabPath, setSelectedGrabPath] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    const timers = collections.map((loc, i) =>
      setTimeout(() => fetchFolder(loc.grabPath), i * 100)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [collections, fetchFolder]);

  const cards = collections
    .filter((c) => c.grabPath !== "iphone_photos")
    .map((loc) => ({
      ...loc,
      coverUrl: loc.cover_url ? "https://home.sriabhi.com" + loc.cover_url : null,
      photoCount: photoData[loc.grabPath]?.total,
      lastUpdated: photoData[loc.grabPath]?.lastUpdated ?? null,
    }));

  const selectedCollection = cards.find((c) => c.grabPath === selectedGrabPath);

  const selectedPhotos = selectedCollection
    ? photoData[selectedCollection.grabPath]?.photos ?? []
    : [];

  const isSelectedPrivate = !!selectedCollection?.private;

  const actions = [
    {
        name: "Back",
        icon: () => <ChevronLeft size={16} />,
        onClick: () => setSelectedGrabPath(null)
    },
    {
        name: "Add photos",
        icon: () => <Plus size={16} />,
        onClick: () => {
            if (!selectedCollection) return;
            const collectionParam = selectedCollection.grabPath.startsWith("trips/")
                ? selectedCollection.grabPath.split("/")[1]
                : selectedCollection.grabPath;
            router.push(`/internal/photo_tools/upload_photos?collection=${encodeURIComponent(collectionParam)}`);
        },
    },
    {
        name: isSelectedPrivate ? "Take public" : "Take private",
        icon: () => (isSelectedPrivate ? <Unlock size={16} /> : <Lock size={16} />),
        onClick: async () => {
            if (!selectedCollection?.collection_id) return;
            try {
                const res = await fetch("/api/photos/toggle-collection-status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ collection_id: selectedCollection.collection_id }),
                });
                if (!res.ok) throw new Error("Failed to toggle collection status");
                const data = await res.json();
                updateCollection(selectedCollection.grabPath, { private: data.active });
            } catch (err) {
                console.error("Error toggling collection status:", err);
            }
        },
    },
    {
        name: "Delete",
        icon: () => <Trash2 size={16} />,
        danger: true,
    },
  ]
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2F3] p-1 sm:p-3">
      <DashNav />
      <div className="mb-2 mt-12 lg:mt-10 items-start" />

      {selectedCollection ? (
            <div className="flex flex-1 flex-col w-full">
                <div className="flex flex-col sm:flex-row w-full justify-center sm:justify-start items-center sm:items-end sm:gap-x-4 gap-y-2">
                    {selectedCollection.coverUrl ? (
                        <Image
                            src={selectedCollection.coverUrl}
                            quality={60}
                            height={500}
                            width={500}
                            className="object-cover rounded-md"
                            alt={selectedCollection.name}
                        />
                    ) : (
                        <div className="h-[500px] w-[500px] max-w-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-md" />
                    )}
                    <div className="text-center sm:text-left">
                        <h1 className="font-serif-custom text-black text-4xl sm:text-5xl">
                            {selectedCollection.name}
                        </h1>
                        <h3 className="font-serif-custom sm:text-xl text-black text-black/80">
                            {selectedCollection.photoCount ?? 0}
                            {selectedCollection.photoCount === 1 ? " photo" : " photos"}
                            {selectedCollection.lastUpdated
                                ? ` | ${new Date(selectedCollection.lastUpdated).toLocaleDateString()}`
                                : ""}
                        </h3>
                    </div>
                </div>
                <div className="w-full mt-4 flex items-center gap-2 overflow-x-auto scrollbar-hidden snap-x snap-mandatory pb-1 -mx-1 px-2 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0">
                    {actions.map((item, index) => (
                        <button
                            key={item.name + index}
                            type="button"
                            onClick={() => item.onClick?.()}
                            className={`flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95 hover:cursor-pointer ${
                                item.danger
                                    ? "border-red-200 text-red-600 hover:bg-red-50"
                                    : "border-black/15 text-black hover:bg-black/5"
                            }`}
                        >
                            {item.icon()}
                            {item.name}
                        </button>
                    ))}
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#D8D0D3] bg-white shadow-sm">
                    {selectedPhotos.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <p className="text-sm text-[#7A6B70]">No photos yet.</p>
                        </div>
                    ) : (
                        selectedPhotos.map((photo, index) => (
                            <PhotoRow
                                key={`${selectedCollection.grabPath}-${photo.url}-${index}`}
                                photo={{ ...photo, collectionName: selectedCollection.name }}
                                index={index}
                            />
                        ))
                    )}
                </div>
            </div>
        ) 
        : (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-[#D8D0D3] bg-white px-4 py-12 text-center">
                        <p className="text-sm text-[#7A6B70]">No collections yet.</p>
                    </div>
                ) : (
                    cards.map((item, index) => (
                        <div
                            key={item.grabPath}
                            className="min-h-60 rounded-md relative hover:cursor-pointer overflow-hidden"
                            onClick={() => setSelectedGrabPath(item.grabPath)}
                        >
                            {item.coverUrl ? (
                                <Image
                                    src={item.coverUrl}
                                    fill
                                    quality={60}
                                    loading={index < 3 ? 'eager' : 'lazy'}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover rounded-md"
                                    alt={item.name}
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 rounded-md" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 rounded-md" />
                            <p className="absolute text-2xl bottom-2 left-3 font-serif-custom text-white font-semibold flex items-center gap-x-2">
                                {item.name}
                                {item.private && <Lock size={16} color="white" />}
                            </p>
                            <div className="absolute bottom-2 right-3 text-right">
                                <p className="text-xl font-serif-custom text-white">
                                {item?.photoCount} {item?.photoCount === 1 ? "photo" : "photos"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )
      }
    </div>
  );
}
