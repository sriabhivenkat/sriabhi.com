// app/blog/[id]/BlogPostClient.tsx
"use client";
import { useEffect, useState, useRef} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import Image from "next/image";
import CopyableCodeBlock from "@/components/CodeBlock";
import Navbar from "@/components/Navbar";
import { getAccessToken } from "../../functions/abhiPcCalls";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AArrowDown, ArrowDown, ChevronDown} from "lucide-react";
import { usePhotoStore } from "../../hooks/usePhotoStore";
import { Collection, useCollectionStore } from "../../hooks/useCollectionsStore";
import Link from "next/link";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;
interface GeoTag {
    offset: number;
    heading: string;
    headingId: string;
    level: number;
    lat: number;
    lng: number;
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
  geotags?: GeoTag[];
  collection_id?: string;
}

function scrollToHeading(headingId: string) {
  const el = document.getElementById(headingId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function BlogGeoMap({
  geotags,
  contentRef,
  contentLengthRef,
}: {
  geotags?: GeoTag[];
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentLengthRef: React.RefObject<number>;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!geotags || geotags.length === 0 || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const first = geotags[0];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/kastech/cmhsf9202002s01s9h22ndwoe",
      center: [first.lng, first.lat],
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const bounds = new mapboxgl.LngLatBounds();

    map.on("load", () => {
      // Draw route line connecting markers
      if (geotags.length > 1) {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: geotags.map((tag) => [
                tag.lng,
                tag.lat,
              ]),
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
        const marker = new mapboxgl.Marker({ color: "#3D2B2E" })
          .setLngLat([tag.lng, tag.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<strong>${tag.heading}</strong>`)
          )
          .addTo(map);

        marker.getElement().style.cursor = "pointer";

        marker.getElement().addEventListener("click", () => {
          const el = contentRef.current;
          const totalLength = contentLengthRef.current;

          if (!el || !totalLength) return;

          const ratio = Math.min(Math.max(tag.offset / totalLength, 0), 1);
          const elementTop = el.getBoundingClientRect().top + window.scrollY;
          const targetScroll =
            elementTop + ratio * el.scrollHeight - 150;

          window.scrollTo({
            top: targetScroll,
            behavior: "smooth",
          });
        });

        bounds.extend([tag.lng, tag.lat]);
      });

      if (geotags.length > 1) {
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 14,
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [geotags]);

  return (
    <div
      ref={mapContainerRef}
      className="
      w-full
      h-56
      lg:h-[calc(75vh-120px)]
      rounded-lg
      overflow-hidden
      "
    />
  );
}

export default function BlogPostClient({ id }: { id: string }) {
  const [content, setContent] = useState<string>("");
  const [post, setPost] = useState<Post>();
  const [token, setToken] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const contentLengthRef = useRef<number>(0);

  useEffect(() => {
    contentLengthRef.current = content.length;
  }, [content]);
  function scrollToOffset(offset: number, contentRef: React.RefObject<HTMLDivElement>, totalLength: number) {
    const el = contentRef.current;
    if (!el || totalLength === 0) return;

    const ratio = offset / totalLength;
    const targetScroll = ratio * el.scrollHeight;

    el.scrollTo({ top: targetScroll, behavior: "smooth" });
  }
  // Fetch token + list of posts
  useEffect(() => {
    const main = async () => {
      const { access_token } = await getAccessToken();
      setToken(access_token);

      const res = await fetch("https://home.sriabhi.com/api/v1/list_files", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

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
    if (!post || !token) return;

    const loadMarkdown = async () => {
      try {
        const url = "https://home.sriabhi.com/" + post.file_url
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        setContent(text);
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setContent("Failed to load content.");
      }
    };

    loadMarkdown();
  }, [post, token]);
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
                className="w-full bg-[#3D2B2E] rounded-lg p-2 justify-between items-center flex cursor-pointer"
              >
                <p className="text-white text-md font-serif-custom">
                  Trip Info
                </p>
                <ChevronDown
                  size={30}
                  color="white"
                  className={`transition-transform duration-300 ${tripInfoExpanded ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  tripInfoExpanded ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
              >
                {showGeoMap && <BlogGeoMap geotags={post?.geotags} contentRef={contentRef} contentLengthRef={contentLengthRef} />}
                {post?.collection_id && (
                  <Link
                    className="bg-white rounded-lg w-full mt-2 p-2 flex items-center gap-3"
                    href={`/photos/${bindedCol?.grabPath.split("/")[1]}`}
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={bindedCol?.cover_url || ""}
                        fill
                        quality={100}
                        sizes="64px"
                        className="object-cover"
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
            </div>
          )}
          <div ref={contentRef} className="flex flex-col flex-1 mx-auto prose prose-lg text-black max-w-full overflow-x-hidden">
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
              <BlogGeoMap geotags={post?.geotags} contentRef={contentRef} contentLengthRef={contentLengthRef} />
              {post?.collection_id && (
              <Link className="bg-white rounded-lg w-full mt-2 p-2 flex items-center gap-3" href={`/photos/${bindedCol?.grabPath.split("/")[1]}`}>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={bindedCol?.cover_url || ""}
                    fill
                    quality={100}
                    sizes="64px"
                    className="object-cover"
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