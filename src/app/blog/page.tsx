"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { getAccessToken } from "../../../functions/abhiPcCalls";

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
}

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const main = async () => {
      const { access_token } = await getAccessToken();
      const res = await fetch("https://home.sriabhi.com/api/v1/list_files", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const data: Post[] = await res.json();
      setPosts(
        data
          .map((p) => ({ ...p, date_created: new Date(p.date_created as any) }))
          .filter((p) => p.title !== "abhi_resume")
          .filter((p) => p.active && p.blog_type != 2)
          .sort((a, b) => +b.date_created! - +a.date_created!)
      );
    };
    main();
  }, []);

  const latest = posts[0];
  const others = posts.slice(1);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F4F2F3] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col px-3 pt-12 lg:pt-10 lg:min-h-0 lg:overflow-hidden">
        <div className="mt-2 mb-5 flex-shrink-0">
          <h1 className="text-5xl font-serif-custom font-black text-black">Blog</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:flex-1 lg:min-h-0 lg:overflow-hidden pb-8 lg:pb-0">
          {/* Latest post */}
          {latest ? (
            <Link href={`/blog/${latest.id}`} className="flex flex-col lg:min-h-0 lg:overflow-hidden rounded-lg">
              <h2 className="text-3xl font-serif-custom text-black mb-2 flex-shrink-0">Latest</h2>
              <div className="relative w-full aspect-[3/4] lg:aspect-auto lg:flex-1 lg:min-h-0 overflow-hidden rounded-lg bg-gray-300">
                {!loadedImages[latest.id] && (
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
                )}
                <Image
                  src={latest.cover_photo || ""}
                  alt="cover"
                  fill
                  className={`object-cover transition-opacity duration-700 ${loadedImages[latest.id] ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setLoadedImages(prev => ({ ...prev, [latest.id]: true }))}
                />
              </div>
              <div className="p-3 flex justify-between items-end flex-shrink-0">
                <div>
                  <h3 className="text-4xl font-serif-custom text-black">{latest.title}</h3>
                  <p className="text-md text-black mt-1">{latest.subtitle}</p>
                </div>
                <div className="text-right text-black">
                  <p className="font-serif-custom text-xl">{latest.date_created?.toLocaleDateString()}</p>
                  <p className="text-sm">{latest.minute_read} min read</p>
                </div>
              </div>
            </Link>
          ) : (
            // Skeleton for latest
            <div className="flex flex-col lg:min-h-0 lg:overflow-hidden rounded-lg">
              <h2 className="text-3xl font-serif-custom text-black mb-2 flex-shrink-0">Latest</h2>
              <div className="relative w-full aspect-[3/4] lg:aspect-auto lg:flex-1 lg:min-h-0 overflow-hidden rounded-lg animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
              <div className="p-3 flex justify-between items-end flex-shrink-0">
                <div className="space-y-2">
                  <div className="h-8 w-48 rounded bg-gray-300 animate-pulse" />
                  <div className="h-4 w-32 rounded bg-gray-300 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Right — other reads */}
          <div className="flex flex-col lg:min-h-0 lg:overflow-hidden">
            <h2 className="text-3xl font-serif-custom text-black mb-2 flex-shrink-0">Other reads</h2>
            <div className="lg:flex-1 lg:overflow-y-auto space-y-2 lg:pr-1">
              {others.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col rounded-md overflow-hidden">
                      <div className="relative h-40 w-full rounded-lg animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
                      <div className="py-2 flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="h-5 w-36 rounded bg-gray-300 animate-pulse" />
                          <div className="h-3 w-24 rounded bg-gray-300 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))
                : others.map((post) => (
                    <Link key={post.id} href={`/blog/${post.id}`} className="flex flex-col rounded-md overflow-hidden">
                      <div className="relative h-40 w-full bg-gray-300 rounded-lg overflow-hidden">
                        {!loadedImages[post.id] && (
                          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%]" />
                        )}
                        <Image
                          src={post.cover_photo || ""}
                          alt="cover"
                          fill
                          className={`object-cover rounded-lg transition-opacity duration-700 ${loadedImages[post.id] ? "opacity-100" : "opacity-0"}`}
                          onLoad={() => setLoadedImages(prev => ({ ...prev, [post.id]: true }))}
                        />
                      </div>
                      <div className="py-2 flex justify-between items-start">
                        <div className="max-w-[70%]">
                          <h3 className="text-xl font-serif-custom text-black">{post.title}</h3>
                          <p className="text-sm text-black line-clamp-1">{post.subtitle}</p>
                        </div>
                        <div className="text-right text-sm text-black">
                          <p className="font-serif-custom">{post.date_created?.toLocaleDateString()}</p>
                          <p className="text-xs text-gray-600">{post.minute_read} min</p>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}