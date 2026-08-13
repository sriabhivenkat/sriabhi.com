"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import CommentAccessModal from "@/components/CommentAccessModal";
import TripsMap, { Geotag } from "@/components/TripsMap";
import { Pin } from "lucide-react";

export interface Post {
  title?: string;
  subtitle?: string;
  date_created?: Date;
  minute_read?: number;
  cover_photo?: string;
  id: string;
  active: boolean;
  blog_type: number;
  start_year: number | undefined;
  end_year: number | undefined;
  geotags?: Geotag[];
  pinned?: boolean;
}

function mapBlogType(post: Post) {
  if (post.blog_type === 1) return "Abhi Overthinks";
  if (post.blog_type == 2) return "PROJECT";
  if (post.blog_type == 3) return "MISCELLANEOUS";
  return "TRIP";
}

// Shared shimmer skeleton for cover images
function CoverImage({
  post,
  loaded,
  onLoad,
  className = "",
}: {
  post: Post;
  loaded: boolean;
  onLoad: () => void;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-300 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
      )}
      <Image
        src={post.cover_photo || ""}
        alt="cover"
        fill
        className={`object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={onLoad}
      />
    </div>
  );
}

// Small pinned card — used in the left/right flanking columns
function PinnedSideCard({
  post,
  loaded,
  onLoad,
}: {
  post: Post;
  loaded?: boolean;
  onLoad?: () => void;
}) {
  return (
    <Link href={`/blog/${post.id}`} className="group flex flex-col rounded-lg flex-1 min-h-0">
      <CoverImage post={post} loaded={loaded || false} onLoad={onLoad || (() => {})} className="flex-1 min-h-0" />
      <div className="pt-2 flex-shrink-0">
        <h3 className="text-lg font-serif-custom font-black text-black leading-tight line-clamp-2 flex items-center gap-0.5">
          {post.pinned && <Pin size={14} color="gray"/>} {post.title}
        </h3>
        <h3 className="text-xs text-black/50 leading-tight line-clamp-2 flex items-center gap-0.5">
          {post.subtitle}
        </h3>
        <p className="text-[11px] text-black/40 mt-1">
          {post.date_created?.toLocaleDateString()} · {post.minute_read} min read
        </p>
      </div>
    </Link>
  );
}

// Card used in the horizontal Projects row
function ProjectCard({
  post,
  loaded,
  onLoad,
}: {
  post: Post;
  loaded: boolean;
  onLoad: () => void;
}) {
  const years = post.start_year
    ? `${post.start_year}${post.end_year && post.end_year !== post.start_year ? ` – ${post.end_year}` : post.end_year ? "" : " – Present"}`
    : null;

  return (
    <Link href={`/blog/${post.id}`} className="group flex flex-col w-48 sm:w-56 lg:w-full shrink-0 lg:shrink">
      <CoverImage post={post} loaded={loaded} onLoad={onLoad} className="aspect-[4/3] w-full" />
      <div className="pt-2">
        <h3 className="text-base font-serif-custom font-black text-black leading-tight line-clamp-2 group-hover:underline">
          {post.title}
        </h3>
        <p className="text-xs text-black/60 line-clamp-2 mt-0.5">{post.subtitle}</p>
        {years && <p className="text-[11px] text-black/40 mt-1">{years}</p>}
      </div>
    </Link>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col w-48 sm:w-56 lg:w-full shrink-0 lg:shrink">
      <div className="aspect-[4/3] w-full rounded-lg animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
      <div className="pt-2 space-y-1.5">
        <div className="h-4 w-3/4 rounded bg-gray-300 animate-pulse" />
        <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
        <div className="h-2.5 w-1/3 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

function PinnedSideSkeleton() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 rounded-lg animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
      <div className="pt-2 space-y-1.5 flex-shrink-0">
        <div className="h-4 w-3/4 rounded bg-gray-300 animate-pulse" />
        <div className="h-2.5 w-1/3 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

// A pinned side column: two cards with a divider between them, hidden on mobile
function PinnedSideColumn({
  posts,
  loadedImages,
  markLoaded,
  borderSide,
}: {
  posts: Post[];
  loadedImages: Record<string, boolean>;
  markLoaded: (id: string) => void;
  borderSide: "left" | "right";
}) {
  const borderClass = borderSide === "left" ? "lg:border-l" : "lg:border-r";
  const items = posts.length > 0 ? posts : [undefined, undefined];

  return (
    <div className={`hidden lg:flex flex-col gap-4 lg:col-span-1 min-h-0 ${borderClass} lg:border-gray-300 lg:px-4`}>
      {items.map((post, idx) =>
        post ? (
          <PinnedSideCard
            key={post.id}
            post={post}
            loaded={!!loadedImages[post.id]}
            onLoad={() => markLoaded(post.id)}
          />
        ) : (
          <PinnedSideSkeleton key={idx} />
        )
      )}
    </div>
  );
}

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [showAccessModal, setShowAccessModal] = useState(false);

  useEffect(() => {
    const main = async () => {
      const res = await fetch("/api/list-posts");
      const data: Post[] = await res.json();
      setPosts(
        data
          ?.map((p) => ({ ...p, date_created: new Date(p.date_created as any) }))
          .filter((p) => p.title !== "abhi_resume")
          .filter((p) => p.active)
          .sort((a, b) => +b.date_created! - +a.date_created!)
      );
    };
    main();
  }, []);

  const trips = useMemo(
    () => posts.filter((p) => mapBlogType(p) === "TRIP"),
    [posts]
  );

  const projects = useMemo(
    () => posts.filter((p) => mapBlogType(p) === "PROJECT"),
    [posts]
  );

  const center = useMemo(
    () => posts.find((p) => mapBlogType(p) !== "TRIP" && mapBlogType(p) !== "PROJECT") ?? null,
    [posts]
  );
  const surrounding = useMemo(() => {
    const rest = posts.filter(
      (p) => p.id !== center?.id && mapBlogType(p) !== "TRIP" && mapBlogType(p) !== "PROJECT"
    );
    const pinnedPosts = rest.filter((p) => p.pinned);
    const pinnedIds = new Set(pinnedPosts.map((p) => p.id));
    const unpinnedRest = rest.filter((p) => !pinnedIds.has(p.id));
    return [...pinnedPosts, ...unpinnedRest].slice(0, 4);
  }, [posts, center]);
  const leftTwo = surrounding.slice(0, 2);
  const rightTwo = surrounding.slice(2, 4);

  const featuredIds = useMemo(
    () => new Set([center?.id, ...surrounding.map((p) => p.id)]),
    [center, surrounding]
  );
  const others = useMemo(
    () =>
      posts.filter(
        (p) => !featuredIds.has(p.id) && mapBlogType(p) !== "TRIP" && mapBlogType(p) !== "PROJECT"
      ),
    [posts, featuredIds]
  );

  const markLoaded = (id: string) =>
    setLoadedImages((prev) => ({ ...prev, [id]: true }));

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const handleMarkerClick = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        setSelectedPost(post);
      }
    },
    [posts]
  );
  const markers = useMemo(
    () =>
      trips.map((trip) => ({
        postId: trip.id,
        geotag: trip.geotags?.[0] ?? { lat: 0, lng: 0, label: trip.title || "Trip" },
      })),
    [trips]
  );
  const effectivePost = selectedPost ?? trips[0] ?? null;

  return (
    <div className="min-h-screen bg-[#F4F2F3] flex flex-col mt-5">
      <Navbar />
      <div className="flex-1 flex flex-col px-3 pt-12 lg:pt-10 pb-8">
        {/* Featured / pinned section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:h-[60vh]">
          <PinnedSideColumn
            posts={leftTwo}
            loadedImages={loadedImages}
            markLoaded={markLoaded}
            borderSide="right"
          />

          {/* Center — always the first of the featured 5 */}
          {center ? (
            <Link href={`/blog/${center.id}`} className="flex flex-col lg:col-span-2 min-h-0 rounded-lg">
              <div className="relative w-full aspect-[3/4] lg:aspect-auto lg:flex-1 lg:min-h-0 overflow-hidden rounded-lg bg-gray-300">
                {!loadedImages[center.id] && (
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
                )}
                <Image
                  src={center.cover_photo || ""}
                  alt="cover"
                  fill
                  className={`object-cover transition-opacity duration-700 ${
                    loadedImages[center.id] ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => markLoaded(center.id)}
                />
              </div>
              <div className="pt-3 flex justify-between items-end flex-shrink-0">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-black/40 mb-1">
                    LATEST · {mapBlogType(center)}
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-serif-custom text-black">{center.title}</h3>
                  <p className="text-md text-black mt-1">{center.subtitle}</p>
                </div>
                <div className="text-right text-black flex-shrink-0 pl-3">
                  <p className="font-serif-custom text-xl">{center.date_created?.toLocaleDateString()}</p>
                  <p className="text-sm">{center.minute_read} min read</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col lg:col-span-2 min-h-0">
              <div className="relative w-full aspect-[3/4] lg:aspect-auto lg:flex-1 lg:min-h-0 overflow-hidden rounded-lg animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
              <div className="pt-3 space-y-2 flex-shrink-0">
                <div className="h-8 w-56 rounded bg-gray-300 animate-pulse" />
                <div className="h-4 w-36 rounded bg-gray-300 animate-pulse" />
              </div>
            </div>
          )}

          <PinnedSideColumn
            posts={rightTwo}
            loadedImages={loadedImages}
            markLoaded={markLoaded}
            borderSide="left"
          />

          {/* Mobile fallback: left/right posts render as a simple stack below the hero */}
          <div className="flex flex-col gap-3 lg:hidden">
            {[...leftTwo, ...rightTwo].map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group flex items-start gap-3 py-2.5 border-b border-gray-200 hover:bg-black/[0.03] rounded-md px-1 -mx-1 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-serif-custom font-black text-black truncate group-hover:underline flex items-center gap-1 ">
                    {post.pinned && <Pin size={15} color="gray"/>} {post.title}
                  </h3>
                  <p className="text-xs text-black/60 line-clamp-2 mt-0.5">{post.subtitle}</p>
                  <p className="text-[11px] text-black/40 mt-1">
                    {post.date_created?.toLocaleDateString()} · {post.minute_read} min read
                  </p>
                </div>
                <CoverImage
                  post={post}
                  loaded={!!loadedImages[post.id]}
                  onLoad={() => markLoaded(post.id)}
                  className="h-16 w-16 shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Trips */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <h2 className="text-2xl font-serif-custom text-black mb-3">Trips</h2>
          <div className="w-full lg:h-[40vh] h-[70vh] flex flex-col lg:flex-row gap-y-2 lg:gap-x-2">
            <div className="w-full lg:w-1/2 h-full relative overflow-hidden rounded-lg">
              {trips.length > 0 ? (
                <TripsMap
                  markers={markers}
                  onMarkerClick={handleMarkerClick}
                  center={markers[0].geotag}
                />
              ) : (
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
              )}
            </div>
            <div className="w-full lg:w-1/2 lg:h-full h-1/2 flex flex-col min-h-0">
              {effectivePost ? (
                <Link href={`/blog/${effectivePost.id}`} className="group flex flex-col flex-1 min-h-0 rounded-lg">
                  <CoverImage post={effectivePost} loaded={true} onLoad={() => {}} className="flex-1 min-h-0" />
                  <div className="pt-2 flex-shrink-0">
                    <h3 className="text-3xl font-serif-custom font-black text-black leading-tight line-clamp-2">
                      {effectivePost.title}
                    </h3>
                    <p className="text-[11px] text-black/40 mt-1">
                      {effectivePost.date_created?.toLocaleDateString()} · {effectivePost.minute_read} min read
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex-1 flex items-center justify-center text-black/40 text-sm">No trips yet</div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-300">
          <h2 className="text-2xl font-serif-custom text-black mb-1">Projects</h2>
          <p className="text-sm text-black/50 italic mb-3">AI is probably taking my job. This is how I cope (or learn).</p>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-3 px-3 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] lg:overflow-visible">
            {posts.length === 0
              ? Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)
              : projects.map((post) => (
                  <ProjectCard
                    key={post.id}
                    post={post}
                    loaded={!!loadedImages[post.id]}
                    onLoad={() => markLoaded(post.id)}
                  />
                ))}
          </div>
        </div>

        {/* Other reads — everything past the featured 5 */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <h2 className="text-2xl font-serif-custom text-black mb-2">Other reads</h2>
          {posts.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex items-start gap-3 py-2.5 border-b border-gray-200 ${i === 0 ? "border-t" : ""}`}>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 rounded bg-gray-300 animate-pulse" />
                    <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
                    <div className="h-2.5 w-1/3 rounded bg-gray-200 animate-pulse" />
                  </div>
                  <div className="relative h-16 w-16 shrink-0 rounded-lg animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
                </div>
              ))
            : others.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className={`group flex items-start gap-3 py-2.5 border-b border-gray-200 hover:bg-black/[0.03] rounded-md px-1 -mx-1 transition-colors ${
                    index === 0 ? "border-t" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="sm:text-lg text-xl font-serif-custom font-black text-black truncate group-hover:underline">
                      {post.title}
                    </h3>
                    <p className="text-xs text-black/60 line-clamp-2 mt-0.5">{post.subtitle}</p>
                    <p className="text-[11px] text-black/40 mt-1">
                      {post.date_created?.toLocaleDateString()} · {post.minute_read} min read
                    </p>
                  </div>
                  <CoverImage
                    post={post}
                    loaded={!!loadedImages[post.id]}
                    onLoad={() => markLoaded(post.id)}
                    className="h-16 w-16 shrink-0"
                  />
                </Link>
              ))}
        </div>
      </div>
      <CommentAccessModal open={showAccessModal} onClose={() => setShowAccessModal(false)} />
    </div>
  );
}