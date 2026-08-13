// app/blog/[id]/BlogPostClient.tsx
"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import Image from "next/image";
import CopyableCodeBlock from "@/components/CodeBlock";
import Navbar from "@/components/Navbar";
import mapboxgl from "mapbox-gl";
import MapboxMap from "./MapboxMap";
import { AArrowDown, ArrowDown, ChevronDown, MapPin } from "lucide-react";
import { usePhotoStore } from "../../hooks/usePhotoStore";
import { Collection, useCollectionStore } from "../../hooks/useCollectionsStore";
import Link from "next/link";
import TextAnnotator from "./TextAnnotator";

interface GeoMarker {
  lat: number;
  lng: number;
  label: string;
}

interface Post {
  file_url: string;
  title?: string;
  subtitle?: string;
  cover_photo?: string;
  minute_read?: number;
  date_created?: Date;
  blog_type?: number;
  id: string;
  geotags?: GeoMarker[];
  collection_id?: string;
}

function scrollToHeading(headingId: string) {
  const el = document.getElementById(headingId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function BlogGeoMap({ geotags }: { geotags?: GeoMarker[] }) {
  if (!geotags || geotags.length === 0) return null;
  const first = geotags[0];

  return (
    <MapboxMap
      key={geotags.map((t) => `${t.lat},${t.lng}`).join("|")}
      center={[first.lng, first.lat]}
      zoom={10}
      navigationControl
      className="w-full h-56 lg:h-[calc(75vh-120px)] rounded-lg overflow-hidden"
      onLoad={(map) => {
        const bounds = new mapboxgl.LngLatBounds();

        if (geotags.length > 1) {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: geotags.map((tag) => [tag.lng, tag.lat]),
              },
              properties: {},
            },
          });

          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            paint: {
              "line-color": "#3D2B2E",
              "line-width": 3,
              "line-opacity": 0.8,
            },
          });
        }

        geotags.forEach((tag) => {
          const marker = new mapboxgl.Marker({ color: "#3D2B2E" }).setLngLat([tag.lng, tag.lat]);

          if (tag.label) {
            marker.setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${tag.label}</strong>`)
            );
          }

          marker.addTo(map);
          bounds.extend([tag.lng, tag.lat]);
        });

        if (geotags.length > 1) {
          map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
      }}
    />
  );
}
export default function BlogPostClient({ id }: { id: string }) {
  const [content, setContent] = useState<string>("");
  const [post, setPost] = useState<Post>();
  const [loaded, setLoaded] = useState(false);

  // Fetch list of posts
  useEffect(() => {
    const main = async () => {
      const res = await fetch("/api/list-posts");
      const data = await res.json();
      const newPosts = data.map((p: any) => ({
        ...p,
        date_created: new Date(p.date_created),
      }));

      setPost(newPosts.find((p: Post) => p.id === id));
    };

    main();
  }, [id]);

  // Fetch markdown file
  useEffect(() => {
    if (!post) return;

    const loadMarkdown = async () => {
      try {
        const res = await fetch(`/api/blog-content?id=${encodeURIComponent(post.id)}`);
        const text = await res.text();
        setContent(text);
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setContent("Failed to load content.");
      }
    };

    loadMarkdown();
  }, [post]);
  const { photoData, fetchFolder } = usePhotoStore();
  const { collections, fetchCollections } = useCollectionStore();
  const [bindedCol, setBindedCol] = useState<Collection>();
  const [tripInfoExpanded, setTripInfoExpanded] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);
  useEffect (() => {
    if (post?.collection_id) {
      const c = collections.filter((c) => c.collection_id === post.collection_id)
      console.log(c)
      if (c) {
        fetchFolder(c[0]?.grabPath || "")
        setBindedCol({
          ...c[0],
          cover_url: photoData[c[0]?.grabPath]?.coverUrl || "",
        })
      }
    }
  }, [post, photoData])
  const showGeoMap = post?.blog_type === 4 && post.geotags && post.geotags.length > 0;
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#F4F2F3] p-5 mt-15 lg:mt-10">
      <Navbar />
      <div className={`flex flex-col h-full w-full gap-x-2 ${showGeoMap ? "lg:flex-row" : "items-center"}`}>
        <div className={`flex flex-col items-center w-full ${showGeoMap ? "lg:w-2/3" : "max-w-3xl"}`}>
          <div className="w-full flex flex-col items-center mb-5">
              {post?.cover_photo && (
                <Image
                    src={post.cover_photo}
                    className={`w-full max-h-96 object-cover rounded-lg mb-4 bg-gray-300 ${!loaded && "animate-pulse"}`}
                    alt="Cover preview"
                    placeholder="blur"
                    blurDataURL={post.cover_photo}
                    width={600}
                    height={500}
                    onLoad={() => setLoaded(true)}
                />
              )}
              <h1 className="text-3xl md:text-5xl font-serif-custom text-black font-black text-center">
                  {post?.title}
              </h1>
              <h2 className="text-md md:text-lg text-black text-center mt-2">
                  {post?.subtitle}
              </h2>
          </div>
          <div className="mb-5 border-b-1 border-gray-400 pb-1">
              <p className="text-black text-lg md:text-xl font-serif-custom">
                  Sriabhi Venkat | {post?.date_created?.toLocaleString('en-US', {
                          hour: 'numeric', minute: 'numeric', hour12: true,
                          month: '2-digit', day: '2-digit', year: 'numeric',
                      })} | {post?.minute_read} minute read 
              </p>
          </div>
          {post?.blog_type === 4 && (
            <div className="w-full mb-5 lg:hidden">
              <button
                type="button"
                onClick={() => setTripInfoExpanded((prev) => !prev)}
                className="w-full bg-[#3D2B2E] hover:bg-[#4a3439] active:scale-[0.99] rounded-xl px-4 py-3 justify-between items-center flex cursor-pointer shadow-sm transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={18} color="white" />
                  <p className="text-white text-md font-serif-custom font-bold tracking-wide">
                    Trip Info
                  </p>
                </span>
                <ChevronDown
                  size={22}
                  color="white"
                  className={`transition-transform duration-300 ${tripInfoExpanded ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  tripInfoExpanded ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-2 rounded-xl border border-[#E8E2E4] bg-white/70 p-2 shadow-sm">
                  {showGeoMap && (
                    <div className="overflow-hidden rounded-lg">
                      <BlogGeoMap geotags={post?.geotags} />
                    </div>
                  )}
                  {post?.collection_id && bindedCol?.cover_url && (
                    <Link
                      className="group bg-white rounded-lg w-full p-2 flex items-center gap-3 border border-[#E8E2E4] hover:border-[#3D2B2E]/30 hover:bg-[#F4F2F3] transition-colors"
                      href={`/photos/${bindedCol.grabPath.split("/")[1]}`}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={bindedCol.cover_url}
                          fill
                          quality={100}
                          sizes="64px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          alt={bindedCol.name || "Collection cover"}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm text-gray-500 font-serif-custom">Associated Collection</p>
                        <h1 className="text-xl font-serif-custom font-black text-[#3D2B2E] truncate">
                          {bindedCol?.name}
                        </h1>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col flex-1 mx-auto prose prose-lg text-black max-w-full overflow-x-hidden">
              <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 text-black" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 text-black" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2 text-black" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 text-black" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 text-black" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1 text-black" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 text-black" {...props} />,
                      code: ({ node, inline, children, ...props }: any) => {
                        if (inline) {
                          return (
                            <code
                              className="bg-gray-100 px-1 py-0.5 rounded break-words"
                              {...props}
                            />
                          );
                        }
                        return <CopyableCodeBlock>{children}</CopyableCodeBlock>
                      },
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative text-black underline decoration-2 underline-offset-2 
                                    hover:decoration-gray hover:decoration-4 
                                    inline-flex items-center justify-center gap-1 transition duration-300"
                        >
                          {props.children}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 inline-block decoration-2 hover:decoration-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 6h8m0 0v8m0-8L10 14m-4 4h12"
                            />
                          </svg>
                          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent 
                                          group-hover:bg-white"></span>
                        </a>
                      ),
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
        {showGeoMap && (
           <div className="w-1/3 h-1/2 sticky top-14 overflow-hidden">
              <BlogGeoMap geotags={post?.geotags} />
              {post?.collection_id && bindedCol?.cover_url && (
              <Link
                className="group bg-white rounded-lg w-full mt-2 p-2 flex items-center gap-3 border border-[#E8E2E4] shadow-sm hover:border-[#3D2B2E]/30 hover:bg-[#F4F2F3] transition-colors"
                href={`/photos/${bindedCol?.grabPath.split("/")[1]}`}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={bindedCol.cover_url}
                    fill
                    quality={100}
                    sizes="64px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    alt={bindedCol?.name || "Collection cover"}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm text-gray-500 font-serif-custom">Associated Collection</p>
                  <h1 className="text-xl font-serif-custom font-black text-[#3D2B2E] truncate">
                    {bindedCol?.name}
                  </h1>
                </div>
              </Link>
            )}
            </div>
        )}
      </div>
    </div>
  );
}