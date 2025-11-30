'use client'

import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useStravaActivities } from '../../../hooks/useStravaActivity';


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
    <div className="min-h-screen flex flex-col mt-15 lg:mt-0 p-5 overflow-hidden bg-[#F4F2F3]">
      <Navbar />

      <div className="w-full flex flex-col lg:flex-row items-center justify-evenly">
        <div className='justify-self-start lg:max-w-1/3'>
          <h1 className="font-serif-custom text-black text-3xl lg:text-5xl">
            Hi, I'm Abhi.
          </h1>
          <p className="font-serif-custom text-black tracking-wide mt-1 text-lg lg:text-2xl">
            Well, my full name is <em className="mr-1">really</em> <b>Sriabhinandan Venkataraman</b>
          </p>
          <p className="font-serif-custom text-black tracking-wide mt-1 text-md lg:text-lg">
            I'm a software engineer based out of New York City. I love building cool things that solve the problems
            my friends, family, and I face in our daily lives.
            <br/> 
            In my free time, I love photography, climbing, running, and hiking (so original, I know). 
            I'm a huge football fan - I love the Texas A&M Aggies and the Seattle Seahawks.
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
      <div className="flex flex-col px-8">
        <h1 className="text-2xl text-black">
          My Runs
        </h1>
        <div className="w-full flex items-center justify-evenly overflow-auto mt-2 gap-2 py-2 px-1">
          {runs.map((item, index) => (
            <div className='min-w-60 min-h-80 p-3 rounded flex flex-col justify-evenly shadow-md border border-gray-200' key={index}>
              <img
                src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${item.start_latlng[1]},${item.start_latlng[0]},14/400x200?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                className="w-full h-32 object-cover rounded"
              />
              <div>
                <h1 className="text-black font-serif-custom text-3xl lg:text-2xl">
                  {item.distance}m • {getTotalMovingTime(item.moving_time)}
                </h1>
                <h2 className='text-black text-md'>
                  {(item.distance / item.moving_time).toFixed(2)}m/s pace
                </h2>
                <h1 className="text-black text-md lg:text-sm">
                  {item.name}
                </h1>
                <p className="text-black text-xs lg:text-md">
                  {new Date(item.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
