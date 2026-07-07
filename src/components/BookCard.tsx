'use client'
import React, { useState, useEffect } from 'react';
interface Book {
    title: string,
    author: string,
    cover: string,
    goodreads: string,
    height: string,
}

export default function BookCard({ title, author, cover, goodreads, height }: Book) {
  return (
    <div className="flex flex-col">
    <a
      href={goodreads}
      target="_blank"
      rel="noopener noreferrer"
      className="block cursor-pointer rounded-xl bg-gray-100 border border-gray-200 p-14 hover:bg-gray-200 transition-background duration-[0.5s] w-full bookPerspectiveContainer"
    >
      <div className="flex h-full justify-center items-center gap-[0] !my-0 bookPerspective">
        <div className="text-left absolute top-[-24px] left-[-24px] right-[-24px] opacity-0 -translate-y-4 transition-all duration-500 ease-in-out !my-0 bookMetaText">
          <h3 className="!text-lg font-bold leading-[1.2] !my-0 font-serif-custom text-black">{title}</h3>
          <p className="!text-base !mt-1 !text-gray-600 !mb-0">{author}</p>
        </div>
        <div
          className='!my-0 relative transition-transform duration-[0.5s] ease-in-out shrink-0 lg:w-1/2 order-1 w-full max-w-[120px] after:block after:content-[""] after:bg-gray-100 after:w-[calc(100%+0.5px)] after:absolute after:left-0 after:rounded-l-md after:border-y-[3px] after:border-l-[4px] after:border-gray-800 before:block before:content-[""] before:bg-white before:h-[calc(100%+0.5px)] before:absolute before:-right-[0] before-top-0 before:border-x-[3px] before:border-x-gray-800 before:border-t-[3px] before:border-t-gray-200 bookThreeD'
          style={{ '--book-height': height } as any}
        >
          <img src={cover} alt={title} className="rounded-[3px] w-full" />
        </div>
        <div className="absolute font-bold !text-blue-600 text-sm bottom-[-24px] left-[-24px] right-[-24px] opacity-0 translate-y-4 transition-[opacity,transform] duration-500 ease-in-out block !my-0 bookMetaText">
          <span className="inline-flex items-center mr-1 cursor-pointer relative underline decoration-dotted decoration-blue-600 underline-offset-[6px] decoration-2">
            View on Goodreads
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 13 13" className="h-2 w-2 ml-[6px] fill-blue-600">
              <path d="M13 1.05a1 1 0 0 0-1-1L4 0a1 1 0 0 0 0 2h5.56l-8.27 8.29a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219L11 3.42V9a1 1 0 0 0 2 0V1.05Z"></path>
            </svg>
          </span>
        </div>
      </div>
    </a>
    <div className="lg:hidden mt-4 px-2">
        <p className="text-sm font-bold font-serif-custom text-black leading-tight">{title}</p>
        <p className="text-xs text-gray-600 mt-1">{author}</p>
      </div>
    </div>
  );
}