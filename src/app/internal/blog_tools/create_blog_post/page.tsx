"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { getAccessToken, getStoredAccessToken } from "../../../../../functions/abhiPcCalls";
import Login from "@/components/Login";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { Collection, useCollectionStore } from "../../../../../hooks/useCollectionsStore";
import { PhotoWithMetadata, usePhotoStore } from "../../../../../hooks/usePhotoStore";
import Link from "next/link";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type HeadingItem = { heading: string; level: number };
type HeadingGeoTag = {
  offset: number;
  heading: string;
  level: number;
  lat: number;
  lng: number;
};

function PhotoInsertPanel({
  onInsert,
  isBind = false,
  onBind,
  bindedCol
}: {
  onInsert: (photo: PhotoWithMetadata) => void;
  isBind?: boolean;
  onBind?: (collection: Collection) => void;
  bindedCol?: Collection;
}) {
  const { collections, fetchCollections, loading: collectionsLoading } = useCollectionStore();
  const { photoData, fetchFolder, loading: photosLoading } = usePhotoStore();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleToggleCollection = (loc: Collection) => {
    if (isBind) {
      onBind?.(loc);
      return;
    }
    if (expandedPath === loc.grabPath) {
      setExpandedPath(null);
      return;
    }
    setExpandedPath(loc.grabPath);
    fetchFolder(loc.grabPath);
  };

  return (
    <div className="h-56 w-full rounded-lg border border-gray-300 overflow-y-auto p-2 flex flex-col gap-1">
      {collectionsLoading ? (
        <p className="text-xs text-gray-500 p-2">Loading collections...</p>
      ) : collections.length === 0 ? (
        <p className="text-xs text-gray-500 p-2">No collections found.</p>
      ) : (
        collections.map((loc) => {
          const isExpanded = expandedPath === loc.grabPath;
          const isBinded = isBind && bindedCol?.grabPath === loc.grabPath;
          const isLoadingPhotos = photosLoading[loc.grabPath];
          const photos = photoData[loc.grabPath]?.photos ?? [];

          return (
            <div key={loc.grabPath} className="flex flex-col">
              <button
                type="button"
                onClick={() => handleToggleCollection(loc)}
                className={`text-left text-sm px-2 py-1.5 rounded-md transition ${
                  isBinded || isExpanded
                    ? "bg-[#3D2B2E] text-white"
                    : "bg-gray-50 text-black hover:bg-gray-100"
                }`}
              >
                {loc.name || loc.grabPath}
              </button>

              {isExpanded ? (
                <div className="grid grid-cols-4 gap-1 p-1.5">
                  {isLoadingPhotos ? (
                    <p className="col-span-4 text-xs text-gray-500 p-1">Loading photos...</p>
                  ) : photos.length === 0 ? (
                    <p className="col-span-4 text-xs text-gray-500 p-1">No photos in this collection.</p>
                  ) : (
                    photos.map((photo) => (
                      <button
                        key={photo.pid}
                        type="button"
                        onClick={() => onInsert(photo)}
                        className="relative aspect-square overflow-hidden rounded-md border border-gray-200 hover:ring-2 hover:ring-[#3D2B2E] transition"
                        title="Insert this photo"
                      >
                        <Image
                          src={photo.url}
                          alt={photo.metadata?.description || loc.name || "Photo"}
                          fill
                          className="object-cover"
                          sizes="150px"
                          quality={85}
                        />
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [startYear, setStartYear] = useState(0);
  const [endYear, setEndYear] = useState(0);
  useEffect(() => {
    const t = getStoredAccessToken();
    setToken(t);
    setChecked(true);
  }, []);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [editorTag, setEditorTag] = useState<"photo" | "map" | "bind">("map");
  const [tableOfContents, setTableOfContents] = useState<HeadingItem[]>([]);
  const [bindedCol, setBindedCol] = useState<Collection>();
  useEffect(() => {
    const differentiatedHeadings = Array.from(
      content.matchAll(/^(#{1,3})\s+(.*)$/gm)
    ).map((match) => ({
      heading: match[2],
      level: match[1].length,
    }));
    setTableOfContents(differentiatedHeadings);
  }, [content]);

  const headingOffsets = useMemo(() => {
    return Array.from(content.matchAll(/^(#{1,3})\s+(.*)$/gm)).map((m) => m.index ?? -1);
  }, [content]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null); // draft marker, while placing a new tag
  const savedMarkersRef = useRef<Record<number, mapboxgl.Marker>>({}); // one persistent marker per tagged heading
  const [pendingPoint, setPendingPoint] = useState<{ lat: number; lng: number } | null>(null);

  const [headingGeoTags, setHeadingGeoTags] = useState<HeadingGeoTag[]>([]);
  const [selectedHeadingIndex, setSelectedHeadingIndex] = useState<number | null>(null);

  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastCursorPosRef = useRef<number>(0);

  const scrollToHeading = (index: number) => {
    const el = document.getElementById(`toc-heading-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Create the map once, right above the textarea, only when the "trip" tag is selected
  useEffect(() => {
    if (selectedTag === "trip" && mapContainerRef.current && !mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/kastech/cmhsf9202002s01s9h22ndwoe",
        center: [-73.9464717, 40.7132148],
        zoom: 9,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({ draggable: true, color: "#3D2B2E" })
            .setLngLat(e.lngLat)
            .addTo(map);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current!.getLngLat();
            setPendingPoint({ lat: pos.lat, lng: pos.lng });
          });
        } else {
          markerRef.current.setLngLat(e.lngLat);
        }
        setPendingPoint({ lat, lng });
      });

      mapRef.current = map;
    }

    if (selectedTag !== "trip" && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
      savedMarkersRef.current = {};
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        savedMarkersRef.current = {};
      }
    };
  }, [selectedTag, editorTag]);

  // Keep one persistent marker per tagged heading in sync with headingGeoTags
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentOffsets = new Set(headingGeoTags.map((t) => t.offset));

    Object.keys(savedMarkersRef.current).forEach((key) => {
      const idx = Number(key);
      if (!currentOffsets.has(idx)) {
        savedMarkersRef.current[idx].remove();
        delete savedMarkersRef.current[idx];
      }
    });

    headingGeoTags.forEach((tag) => {
      if (savedMarkersRef.current[tag.offset]) return;

      const marker = new mapboxgl.Marker({ color: "#1B998B" })
        .setLngLat([tag.lng, tag.lat])
        .addTo(map);

      marker.getElement().style.cursor = "pointer";
      marker.getElement().addEventListener("click", (ev) => {
        ev.stopPropagation();
        const headingIndex = headingOffsets.indexOf(tag.offset);
        if (headingIndex >= 0) {
          scrollToHeading(headingIndex);
        }
      });

      savedMarkersRef.current[tag.offset] = marker;
    });
  }, [headingGeoTags]);

  const handleSaveHeadingTag = () => {
    if (selectedHeadingIndex === null || !pendingPoint) return;

    const heading = tableOfContents[selectedHeadingIndex];
    const offset = headingOffsets[selectedHeadingIndex];

    if (!heading || offset === undefined) return;

    setHeadingGeoTags((prev) => [
      ...prev.filter((t) => t.offset !== offset),
      {
        offset,
        heading: heading.heading,
        headingId: `toc-heading-${selectedHeadingIndex}`, 
        level: heading.level,
        lat: pendingPoint.lat,
        lng: pendingPoint.lng,
      },
    ]);

    setSelectedHeadingIndex(null);
    setPendingPoint(null);

    markerRef.current?.remove();
    markerRef.current = null;
  };

  const handleRemoveHeadingTag = (index: number) => {
    const offset = headingOffsets[index];
    setHeadingGeoTags((prev) => prev.filter((t) => t.offset !== offset));
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      alert("Please provide both a title and content.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const formData = new FormData();

      const markdownBlob = new Blob([content], { type: "text/markdown" });
      const safeTitle = title
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");

      const filename = `${safeTitle}.md`;
      formData.append("files", markdownBlob, filename);

      if (coverPhoto) {
        formData.append("cover_photo", coverPhoto, coverPhoto.name);
      }

      formData.append("title", title);
      formData.append("subtitle", subtitle);
      let tagNum = "1"
      if (selectedTag == "guide") {
        tagNum = "2"
      }
      if (selectedTag == 'misc') {
        tagNum = "3"
      }
      if (selectedTag == 'trip') {
        tagNum = "4"
      }
      formData.append("type", tagNum);
      formData.append("word_count", content.trim().split(/\s+/).length.toString());

      if (bindedCol) {
        formData.append("collection_id", bindedCol?.collection_id || "")
      }
      formData.append("path", "blog");
      if (tagNum === "2") {
        formData.append("start_end_year", `${startYear}-${endYear}`)
      }
      if (selectedTag === "trip" && pendingPoint) {
        formData.append("geotag", JSON.stringify(pendingPoint));
      }
      if (selectedTag === "trip" && headingGeoTags.length > 0) {
        formData.append("heading_geo_tags", JSON.stringify(headingGeoTags));
      }

      const { access_token } = await getAccessToken();

      console.log("FORM DATA CONTENTS:", Array.from(formData.entries()).map(([key, value]) => { return [key, value]; }));

      const res = await fetch("https://home.sriabhi.com/api/v1/upload_files", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Blog uploaded successfully!`);
        setTitle("");
        setSubtitle("");
        setContent("");
        setSelectedTag("");
        setCoverPhoto(null);
        setPendingPoint(null);
        setHeadingGeoTags([]);
      } else {
        alert(data.error || "Failed to upload blog.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload blog.");
    }

    setLoading(false);
  };

  const [readingTime, setReadingTime] = useState(0);
  const lastLengthRef = useRef(0);

  useEffect(() => {
    const calculateReadingTime = (text: string, wpm = 200): number => {
      if (!text.trim()) return 0;
      const words = text.trim().split(/\s+/).length;
      return Math.ceil(words / wpm);
    };

    const currentLength = content.length;
    if (Math.abs(currentLength - lastLengthRef.current) >= 200) {
      const minutes = calculateReadingTime(content);
      setReadingTime(minutes);
      lastLengthRef.current = currentLength;
    }
  }, [content]);

  const tags = [
    { title: "Personal", tag: "personal" },
    { title: "Guide", tag: "guide" },
    { title: "Miscellaneous", tag: "misc" },
    { title: "Trip", tag: "trip" }
  ]

  useEffect(() => {
    const previewEl = previewRef.current;
    if (!previewEl) return;

    const handleScroll = () => {
      isUserScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 1000);
    };

    previewEl.addEventListener('scroll', handleScroll);
    return () => {
      previewEl.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previewEl = previewRef.current;
    if (!previewEl || isUserScrollingRef.current) return;

    requestAnimationFrame(() => {
      previewEl.scrollTo({
        top: previewEl.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [content, title, subtitle, coverPhotoPreview]);

  const handleInsertPhoto = (photo: PhotoWithMetadata) => {
    const altText = photo.metadata?.description || "Photo";
    const markdownImage = `![${altText}](${photo.url} "Caption goes here")\n`;
    const cursorPos = lastCursorPosRef.current;

    const newContent = content.slice(0, cursorPos) + markdownImage + content.slice(cursorPos);
    setContent(newContent);

    lastCursorPosRef.current = cursorPos + markdownImage.length;
  };

  const returnHeadingLevel = (title: { heading: string; level: number }) => {
    if (title.level === 1) return "Title";
    if (title.level === 2) return "Subtitle";
    if (title.level === 3) return "H3";
  }

  // Looks up which TOC index a rendered heading node corresponds to, using
  // its character offset in the source markdown — pure and side-effect-free,
  // so it's safe under React Strict Mode's double-invoked renders.
  const getHeadingIndexFromNode = (node: any): number | undefined => {
    const offset = node?.position?.start?.offset;
    if (offset === undefined) return undefined;
    const idx = headingOffsets.indexOf(offset);
    return idx >= 0 ? idx : undefined;
  };

  return token ? (
    <div className="min-h-screen flex flex-col p-5 overflow-hidden bg-[#F4F2F3]">
      <div className="w-full flex flex-col ">
        <Link className="flex flex-col items-start justify-center mb-4" href="/blog">
          <h1 className="text-3xl font-serif-custom font-black text-black">
            Create Blog Post
          </h1>
        </Link>
      </div>

      <div className="w-full flex gap-4 flex-1">
        {/* Markdown editor */}
        <div className="w-1/2 flex flex-col">
          <div className="w-full flex gap-x-1 mb-2">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            />
            <input
              type="text"
              placeholder="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            />
          </div>
          {selectedTag === "guide" &&
            <div className="flex mb-2 w-full gap-x-2 items-center">
              <select
                value={startYear}
                onChange={(e) => {
                  if (endYear && Number(e.target.value) > endYear) {
                    alert("Start cannot be after end!")
                  } else {
                    setStartYear(Number(e.target.value))
                  }
                }}
                className="p-2 border border-gray-300 rounded-lg text-black text-sm"
              >
                <option value="">Project start year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <p className="text-black text-2xl">-</p>
              <select
                value={endYear}
                onChange={(e) => {
                  if (startYear && Number(e.target.value) < startYear) {
                    alert("End cannot be before start!")
                  } else {
                    setEndYear(Number(e.target.value))
                  }
                }}
                className="p-2 border border-gray-300 rounded-lg text-black text-sm"
              >
                <option value="">Project end year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          }
          <div
            className="w-full flex gap-x-1 mb-2 items-center"
          >
            <input 
              type="file"
              accept="image/*"
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setCoverPhoto(file);
                  setCoverPhotoPreview(URL.createObjectURL(file));
                }
              }}
            />
            <div className="w-full flex flex-col ml-1">
              <div className="flex gap-x-1">
                {tags.map((tag, index) => (
                  <div 
                    key={index} 
                    className={`h-10 ${selectedTag === tag.tag ? "bg-gray-800" : "bg-[#3D2B2E]"} rounded-lg p-3 flex items-center justify-center hover:cursor-pointer`} 
                    onClick={(e) => {
                      if (selectedTag === tag.tag) {
                        setSelectedTag("")
                      } else {
                        setSelectedTag(tag.tag)
                      }
                    }}>
                    <p className={`text-sm ${selectedTag === tag.tag ? "text-white" : "text-white"}`}>
                      {tag.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedTag === "trip" && (
            <div className="w-full mb-2 flex flex-col gap-1">
              <div className="relative w-full bg-[#F4F2F3] border border-gray-300 rounded-lg flex items-center overflow-hidden">
                {/* Sliding background indicator */}
                <div
                  className={`absolute top-0 h-full w-1/3 bg-[#3D2B2E] transition-transform duration-300 ease-in-out ${
                    editorTag === "map"
                      ? "translate-x-full rounded-lg"
                      : editorTag === "bind"
                      ? "translate-x-[200%] rounded-r-lg"
                      : "translate-x-0 rounded-l-lg"
                  }`}
                />

                <button
                  className={`relative z-10 text-sm w-1/3 p-2 h-full font-bold transition-colors duration-300 ${
                    editorTag === "photo"
                      ? "text-[#F4F2F3]"
                      : "text-[#3D2B2E]"
                  }`}
                  onClick={() => setEditorTag("photo")}
                >
                  Insert a photo
                </button>

                <button
                  className={`relative z-10 text-sm w-1/3 p-2 h-full font-bold transition-colors duration-300 ${
                    editorTag === "map"
                      ? "text-[#F4F2F3]"
                      : "text-[#3D2B2E]"
                  }`}
                  onClick={() => setEditorTag("map")}
                >
                  Geotag a header
                </button>

                <button
                  className={`relative z-10 text-sm w-1/3 p-2 h-full font-bold transition-colors duration-300 ${
                    editorTag === "bind"
                      ? "text-[#F4F2F3]"
                      : "text-[#3D2B2E]"
                  }`}
                  onClick={() => setEditorTag("bind")}
                >
                  Associate a collection
                </button>
              </div>

              {editorTag === "map" ? (
                <div>
                  {selectedHeadingIndex !== null ? (
                    <div className="rounded-md bg-gray-100 p-2 text-xs text-black mb-1">
                      Tagging:{" "}
                      <span className="font-bold">
                        "{tableOfContents[selectedHeadingIndex]?.heading}"
                      </span>{" "}
                      — click the map to place a pin.
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 mb-1">
                      Select a heading in the Table of Contents on the right, then click
                      the map to tag it.
                    </p>
                  )}

                  <div
                    ref={mapContainerRef}
                    className="h-56 w-full rounded-lg border border-gray-300"
                  />

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600">
                      {pendingPoint
                        ? `Point: ${pendingPoint.lat.toFixed(6)}, ${pendingPoint.lng.toFixed(6)}`
                        : "No pin placed yet"}
                    </p>

                    <button
                      type="button"
                      disabled={selectedHeadingIndex === null || !pendingPoint}
                      onClick={handleSaveHeadingTag}
                      className="cursor-pointer rounded-lg bg-[#3D2B2E] px-3 py-1.5 text-xs text-white transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2F2428]"
                    >
                      Save tag
                    </button>
                  </div>
                </div>
              ) : editorTag === "bind" ? (
                <div>
                  <PhotoInsertPanel 
                    onInsert={() => {}} 
                    isBind 
                    onBind={(col: Collection) => {
                      if (col === bindedCol) {
                        setBindedCol(undefined);
                      } else {
                        setBindedCol(col);
                      }
                    }} 
                    bindedCol={bindedCol}
                  />
                </div>
              ) : (
                <PhotoInsertPanel onInsert={handleInsertPhoto} />
              )}
            </div>
          )}
          {selectedTag === "trip" && bindedCol && (
            <p className="text-black text-sm ml-1 mb-2"> I'm writing about <span className="font-bold italic font-serif-custom text-lg">{bindedCol.name}</span></p>
          )}
          <textarea
            ref={contentTextareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              lastCursorPosRef.current = e.currentTarget.selectionStart;
            }}
            onSelect={(e) => {
              lastCursorPosRef.current = e.currentTarget.selectionStart;
            }}
            onClick={(e) => {
              lastCursorPosRef.current = e.currentTarget.selectionStart;
            }}
            placeholder="Write your blog post in Markdown..."
            className="flex-1 p-3 text-black rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 max-h-[90vh] overflow-y-auto"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-[#3D2B2E] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create post"}
          </button>
          {successMessage && (
            <p className="mt-2 text-green-600 font-medium">{successMessage}</p>
          )}
        </div>

        <div className="h-[90vh] w-1/2 flex flex-col gap-2">
          {tableOfContents.length > 0 && (
            <div className="max-h-[22.5vh] overflow-y-auto p-2 border border-gray-300 rounded-lg bg-white shrink-0">
              <h3 className="text-2xl font-bold mb-1 text-[#3D2B2E] sticky top-0 bg-white font-serif-custom">Table of Contents</h3>
              <ul className="list-disc list-inside text-black">
                {tableOfContents.map((heading, index) => {
                  const offset = headingOffsets[index];
                  const tag = headingGeoTags.find((t) => t.offset === offset);
                  const isSelected = editorTag === "map" && selectedHeadingIndex === index;

                  return (
                    <div
                      key={index}
                      className={`flex items-stretch gap-x-2 rounded-md px-1 py-0.5 transition ${
                        isSelected ? "bg-[#3D2B2E]/10" : ""
                      }`}
                    >
                      <div
                        className="flex gap-x-2 items-center flex-1 min-w-0 cursor-pointer rounded-md px-1 hover:bg-gray-50"
                        onClick={() => scrollToHeading(index)}
                      >
                        <p className="text-xs text-gray-500">{index + 1}</p>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-lg text-[#3D2B2E] font-serif-custom truncate">{heading.heading}</span>
                          <span className="text-xs text-gray-500">{returnHeadingLevel(heading)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-x-1 shrink-0">
                        {tag ? (
                          <>
                            <span
                              className="text-xs text-[#1B998B]"
                              title={`Geotagged: ${tag.lat.toFixed(4)}, ${tag.lng.toFixed(4)}`}
                            >
                              📍 {tag.lat.toFixed(4)}, {tag.lng.toFixed(4)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveHeadingTag(index)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </>
                        ) : editorTag === "map" ? (
                            <button
                            type="button"
                            onClick={() =>
                              setSelectedHeadingIndex((prev) => (prev === index ? null : index))
                            }
                            className={`text-xs px-2 py-1 rounded-md transition ${
                              isSelected
                                ? "bg-[#3D2B2E] text-white"
                                : "bg-gray-100 text-[#3D2B2E] hover:bg-gray-200"
                            }`}
                          >
                            {isSelected ? "Selected" : "Tag"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    );
                  })}
                </ul>
              </div>
            )}
            {/* Markdown preview */}
            <div className="flex-1 min-h-0 p-5 border border-gray-300 rounded-lg bg-white overflow-y-auto" ref={previewRef}>
                {title || content ? (
                  <div>
                    {title && (
                      <div className="mb-4 border-b-1 border-gray-400">
                        {coverPhotoPreview && (
                          <img
                            src={coverPhotoPreview}
                            className="w-full max-h-96 object-cover rounded-lg mb-4"
                            alt="Cover preview"
                          />
                        )}
                        <h1 className="text-4xl font-bold font-serif-custom text-black">{title}</h1>
                        <h3 className="text-lg font-serif-custom text-gray-600 mb-1">{subtitle}</h3>
                        <p className="font-serif-custom text-gray-600 mb-3">
                          {selectedTag === "guide" ?
                            `${startYear} - ${endYear}`
                            :
                            new Date().toLocaleDateString()
                          } ● {readingTime} min read
                        </p>
                      </div>
                    )}
                    <div className="prose prose-lg max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => {
                            const idx = getHeadingIndexFromNode(node);
                            return <h1 id={idx !== undefined ? `toc-heading-${idx}` : undefined} className="text-3xl font-bold mb-4 text-black" {...props} />;
                          },
                          h2: ({node, ...props}) => {
                            const idx = getHeadingIndexFromNode(node);
                            return <h2 id={idx !== undefined ? `toc-heading-${idx}` : undefined} className="text-2xl font-bold mb-3 text-black" {...props} />;
                          },
                          h3: ({node, ...props}) => {
                            const idx = getHeadingIndexFromNode(node);
                            return <h3 id={idx !== undefined ? `toc-heading-${idx}` : undefined} className="text-xl font-bold mb-2 text-black" {...props} />;
                          },
                          ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 text-black" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 text-black" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1 text-black" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 text-black" {...props} />,
                          code: ({node, inline, ...props}: any) =>
                            inline
                              ? <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />
                              : <code className="block bg-gray-100 p-4 rounded mb-4" {...props} />,
                          table: ({node, ...props}) => <table className="table-auto border-collapse border border-gray-300 mb-4 w-full" {...props} />,
                          thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
                          tbody: ({node, ...props}) => <tbody {...props} />,
                          tr: ({node, ...props}) => <tr className="border-b border-gray-300" {...props} />,
                          th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 text-left font-bold" {...props} />,
                          td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                          img: ({ node, ...props }) => (
                            <div className="flex justify-center my-6">
                              <figure className="inline-block">
                                <img
                                  className="max-w-full max-h-96 rounded-lg block"
                                  {...props}
                                  alt={props.alt || "Image"}
                                />
                                {props.title && (
                                  <figcaption className="mt-2 text-left text-sm italic text-gray-500">
                                    {props.title}
                                  </figcaption>
                                )}
                              </figure>
                            </div>
                          ),
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Live preview will appear here...</p>
                )}
            </div>
          </div>
      </div>
    </div>
  ) : (
    <Login onLoginSuccess={(t) => setToken(t)} />
  );
}