'use client'

import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useStravaActivities } from '../../../hooks/useStravaActivity';
import BookCard from '@/components/BookCard';
import MovieCard from '@/components/MovieCard';
import { ALBUMS, BOOKS, MOVIES } from '@/constants/MEDIA';
import AlbumCard from '@/components/AlbumCard';


export default function Page() {
  // const [runs, setRuns] = useState([])
  const {loading, error, runs} = useStravaActivities();
  console.log("RUNS: ", runs)

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

        <div className="w-full flex flex-col lg:flex-row items-center justify-evenly">
          <div className='justify-self-start lg:max-w-1/3'>
            <h1 className="font-serif-custom text-black text-3xl lg:text-5xl">
              Hi, I'm Abhi.
            </h1>
            <p className="font-serif-custom text-black tracking-wide mt-1 text-md lg:text-lg">
              I'm a software engineer based out of New York City. I love building cool things that solve the problems
              my friends, family, and I face in our daily lives.
              <br/> 
              In my free time, I love photography, climbing, running, and hiking (so original, I know). 
              I'm a huge football fan - I love the Texas A&M Aggies and the Seattle Seahawks.
              Feel free to contact me at <a href="mailto:sriabhi01@gmail.com" className='underline'>sriabhi01@gmail.com</a>.
            </p>
          </div>

          {/* ---- IMAGE FAN ---- */}
          <div className="relative w-[350px] h-[450px] flex items-center justify-center group">
            {/* Back-left top */}
            <Image
              src="https://home.sriabhi.com/api/v1/photo/iphone_photos/IMG_4642.jpeg"
              alt="photo-1"
              width={600}
              height={800}
              className="
                absolute w-[230px] h-[300px] rounded-xl shadow-xl 
                -rotate-12 opacity-0 group-hover:opacity-100 
                group-hover:-translate-x-75 group-hover:translate-y-10
                transition-all duration-700 ease-out
              "
            />

            {/* Back-left bottom */}
            <Image
              src="https://home.sriabhi.com/api/v1/photo/iphone_photos/IMG_2671_Original.jpeg"
              alt="photo-2"
              width={600}
              height={800}
              className="
                absolute w-[230px] h-[300px] rounded-xl shadow-xl 
                -rotate-6 opacity-0 group-hover:opacity-100 
                group-hover:-translate-x-55 group-hover:translate-y-4
                transition-all duration-700 ease-out delay-75
              "
            />

            {/* Back-right top */}
            <Image
              src="https://home.sriabhi.com/api/v1/photo/iphone_photos/IMG_3046.jpeg"
              alt="photo-3"
              width={600}
              height={800}
              className="
                absolute w-[230px] h-[300px] rounded-xl shadow-xl 
                rotate-12 opacity-0 group-hover:opacity-100 
                group-hover:translate-x-65 group-hover:translate-y-10
                transition-all duration-700 ease-out delay-150
              "
            />

            {/* Back-right bottom */}
            <Image
              src="https://home.sriabhi.com/api/v1/photo/iphone_photos/IMG_4066.jpeg"
              alt="photo-4"
              width={600}
              height={800}
              className="
                absolute w-[230px] h-[300px] rounded-xl shadow-xl 
                rotate-6 opacity-0 group-hover:opacity-100 
                group-hover:translate-x-35 group-hover:translate-y-2
                transition-all duration-700 ease-out delay-200
              "
            />

            {/* Front image (bigger) */}
            <Image
              src="https://home.sriabhi.com/api/v1/photo/iphone_photos/IMG_5217.jpeg"
              alt="main"
              width={600}
              height={800}
              className="
                w-[260px] h-[340px] rounded-xl shadow-2xl relative z-30 transition duration-500
              "
            />
          </div>
        </div>
        <div className="mt-10">
          <h2 className="font-serif-custom text-black text-3xl lg:text-4xl mb-6">My Top Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {MOVIES.map((movie) => (
              <MovieCard key={movie.title} {...movie} />
            ))}
          </div>
        </div>
        <div className="mt-10">
          <h2 className="font-serif-custom text-black text-3xl lg:text-4xl mb-6">What I'm Listening To</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ALBUMS.map((album) => (
              <AlbumCard key={album.title} {...album} />
            ))}
          </div>
        </div>
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
