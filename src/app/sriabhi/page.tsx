'use client'

import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useStravaActivities } from '../../../hooks/useStravaActivity';
import BookCard from '@/components/BookCard';
import MovieCard from '@/components/MovieCard';
import { ALBUMS, BOOKS, MOVIES } from '@/constants/MEDIA';
import AlbumCard from '@/components/AlbumCard';

function RankedRow({
  eyebrow,
  title,
  items,
  renderCard,
}: {
  eyebrow: string;
  title: string;
  items: any[];
  renderCard: (item: any) => ReactNode;
}) {
  const [first, ...rest] = items;

  return (
    <div className="mt-10 pt-6 border-t border-gray-300">
      <p className="text-xs uppercase tracking-widest text-black/40 mb-1">{eyebrow}</p>
      <h2 className="font-serif-custom text-black text-3xl lg:text-4xl mb-6">{title}</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* #1 — larger, own lane */}
        {first && (
          <div className="lg:w-[38%] flex-shrink-0 relative">
            <div className="absolute -top-3 -left-3 z-20 h-10 w-10 rounded-full bg-[#3D2B2E] text-white flex items-center justify-center font-serif-custom text-lg shadow-md">
              1
            </div>
            {renderCard(first)}
          </div>
        )}

        {/* rest — tighter row, smaller badges */}
        {rest.length > 0 && (
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {rest.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -top-2 -left-2 z-20 h-7 w-7 rounded-full bg-[#3D2B2E] text-white flex items-center justify-center font-serif-custom text-xs shadow-md">
                  {idx + 2}
                </div>
                {renderCard(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  const { loading, error, runs } = useStravaActivities();

  const getTotalMovingTime = (seconds: number) => {
    const totalMinutes = seconds / 60
    let decimals = totalMinutes % 1
    const totalSeconds = decimals * 60

    return `${Math.floor(totalMinutes)} min ${Math.round(totalSeconds)}s`
  }

  return (
    <>
      <style>{`
        .bookPerspective { perspective: 500px; }
        .bookThreeD {
          transform-style: preserve-3d;
          transform-origin: center;
        }
        .bookThreeD:before {
          background-image: linear-gradient(90deg, #fff 40%, #f6f6f6 0, #f6f6f6 50%, #fff 0, #fff 90%, #f6f6f6 0, #f6f6f6);
          background-size: 3px 3px;
          transform: translateY(0) translateX(0) translateZ(0) rotateY(-90deg);
          transform-origin: right;
          width: var(--book-height, 30px);
        }
        .bookThreeD:after {
          background-image: linear-gradient(0deg, #f6f6f6 40%, #eaeaed 0, #eaeaed 50%, #f6f6f6 0, #f6f6f6 90%, #eaeaed 0, #eaeaed);
          background-size: 4px 4px;
          transform: translateY(0) translateX(0) translateZ(0) rotateX(-90deg);
          transform-origin: top;
          height: var(--book-height, 30px);
        }
        .bookPerspectiveContainer:hover .bookThreeD {
          transform: rotateX(80deg) rotate(45deg) scale(0.75);
        }
        .bookPerspectiveContainer:hover .bookMetaText {
          opacity: 100;
          transform: translateY(0);
        }
      `}</style>
      <div className="min-h-screen flex flex-col mt-15 lg:mt-0 p-5 overflow-hidden bg-[#F4F2F3]">
        <Navbar />

        {/* Hero */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 mt-12">
          <div className="lg:max-w-md">
            <p className="text-xs uppercase tracking-widest text-black/40 mb-2">
              New York City · Software Engineer
            </p>
            <h1 className="font-serif-custom text-black text-4xl lg:text-6xl leading-tight">
              Hi, I'm Abhi.
            </h1>
            <p className="text-black/80 tracking-wide mt-4 text-base lg:text-lg leading-relaxed">
              I love building cool things that solve the problems my friends, family, and I face
              in our daily lives.
            </p>
            <p className="text-black/80 tracking-wide mt-3 text-base lg:text-lg leading-relaxed">
              In my free time, I love photography, climbing, running, and hiking — so original,
              I know. Huge football fan: Texas A&amp;M Aggies and Seattle Seahawks.
            </p>
            <a
              href="mailto:sriabhi01@gmail.com"
              className="inline-block mt-5 text-sm font-medium text-[#3D2B2E] border-b border-[#3D2B2E]/40 hover:border-[#3D2B2E] transition-colors"
            >
              sriabhi01@gmail.com
            </a>
          </div>

          {/* Single anchor photo with a quiet stack behind it */}
          {/* Photo stack — fans out on hover */}
          <div className="relative w-[300px] h-[380px] flex-shrink-0 group">
            <Image
              src="https://home.sriabhi.com/api/v1/photo/iphone_photos/IMG_2671_Original.jpeg"
              alt=""
              width={600}
              height={800}
              className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-md
                -rotate-3 translate-x-3 translate-y-3 opacity-70
                transition-all duration-500 ease-out
                group-hover:-translate-x-16 group-hover:-rotate-6 group-hover:opacity-100"
            />
            <Image
              src="https://home.sriabhi.com/api/v1/photo/iphone_photos/IMG_3046.jpeg"
              alt=""
              width={600}
              height={800}
              className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-md
                rotate-2 -translate-x-2 translate-y-1.5 opacity-85
                transition-all duration-500 ease-out delay-75
                group-hover:translate-x-16 group-hover:rotate-6 group-hover:opacity-100"
            />
            <Image
              src="https://home.sriabhi.com/api/v1/photo/iphone_photos/IMG_5217.jpeg"
              alt="Abhi"
              width={600}
              height={800}
              className="relative w-full h-full object-cover rounded-xl shadow-2xl z-10
                transition-transform duration-500 ease-out
                group-hover:-translate-y-2"
            />
          </div>
        </div>

        <RankedRow
          eyebrow="Film"
          title="My Top Movies"
          items={MOVIES}
          renderCard={(movie) => <MovieCard {...movie} />}
        />

        <RankedRow
          eyebrow="Music"
          title="What I'm Listening To"
          items={ALBUMS}
          renderCard={(album) => <AlbumCard {...album} />}
        />

        <div className="mt-10">
          <h2 className="font-serif-custom text-black text-3xl lg:text-4xl mb-6">Books I've Read</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {BOOKS.map((book) => (
              <BookCard key={book.title} {...book} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}