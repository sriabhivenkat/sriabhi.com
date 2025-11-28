"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { PhotoWithMetadata, usePhotoStore } from '../../../hooks/usePhotoStore';
import { getAccessToken } from '../../../functions/abhiPcCalls';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Post {
    md_url: string;
    title?: string;
    subtitle?: string;
    date_created?: Date;
    minute_read?: number;
    word_count?: number;
    cover_photo?: string;
    id: string;
}

export default function Page() {
    const [posts, setPosts] = useState<Post[]>([])

    useEffect(() => {
        const main = async() => {
            console.log("CALLING ACCESS TOKEN")
            const {access_token} = await getAccessToken();

            await fetch("https://home.sriabhi.com/api/v1/list_files", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${access_token}` // <-- include JWT here
                },
            })
            .then((res) => res.json())
            .then((data: Post[]) => {
                const newPosts = data.map((post) => ({
                    ...post,
                    date_created: new Date(post.date_created as Date) 
                }));

                newPosts.sort((a: any, b:any) => b.date_created - a.date_created);
                console.log(newPosts)
                setPosts(newPosts.filter((post) => post.title !== "abhi_resume"));
            });           
        }
        main()
    }, [])

    return (
        <div className="min-h-screen flex flex-col p-2 py-3 bg-[#F4F2F3]">
            <Navbar />
            <div className="mt-12 lg:mt-10 flex flex-col flex-1">
            {/* Header / Title section */}
            <div className="ml-2 flex flex-col items-start justify-center mb-5">
                <div className="flex w-full justify-between items-center">
                    <h1 className="text-5xl font-serif-custom font-black text-black">Blog</h1>
                </div>
            </div>

            {/* This container will now fill all remaining vertical height */}
            <div className="ml-2 w-full flex flex-col lg:flex-row flex-1 overflow-hidden pr-2 gap-4">
                <Link
                    className="h-52 w-full lg:w-2/3 lg:h-auto flex flex-col rounded-lg bg-center bg-cover hover:cursor-pointer"
                    style={{ backgroundImage: `url(${posts[0]?.cover_photo})` }}
                    href={`/blog/${posts[0]?.id}`}
                >
                    {/* This div pushes content to bottom */}
                    <div className="mt-2 p-4 flex items-center justify-between rounded-lg">
                        <div className='flex flex-col'>
                            <h1 className="text-4xl lg:text-5xl font-serif-custom text-white text-left">
                                {posts[0]?.title}
                            </h1>
                            <p className="text-md text-white text-left mt-1">
                                {posts[0]?.subtitle}
                            </p>
                        </div>
                        <div className='text-right'>
                            <p className="font-serif-custom text-xl">
                                {posts[0]?.date_created?.toLocaleDateString()}
                            </p>
                            <p className="text-sm">
                                {posts[0]?.minute_read} minute read
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Right container (optional) */}
                <div className="w-full lg:w-1/3">
                    <h1 className="text-4xl font-serif-custom text-black">Other reads</h1>
                    <div className="h-full flex flex-1 flex-col space-y-3 mt-2 overflow-auto">
                        {posts.slice(1).map((post, index) => (
                            <Link
                                className="h-36 lg:h-32 w-full rounded-md hover:cursor-pointer bg-cover"
                                style={{ backgroundImage: `url(${post.cover_photo})` }}
                                href={`/blog/${post.id}`}
                                key={index}
                            >
                                <div className="mt-auto bg-black/20 p-4 flex flex-col lg:flex-row justify-between h-full rounded-md items-start">
                                    <div className='flex flex-col'>
                                        <h1 className="text-4xl lg:text-3xl font-serif-custom text-white text-left">
                                            {post?.title}
                                        </h1>
                                        <p className="text-md text-white text-left mt-1">
                                            {post?.subtitle}
                                        </p>
                                    </div>
                                    <div className='text-left lg:text-right'>
                                        <p className="font-serif-custom text-xl">
                                            {post?.date_created?.toLocaleDateString()}
                                        </p>
                                        <p className="text-sm">
                                            {post?.minute_read} minute read
                                        </p>
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