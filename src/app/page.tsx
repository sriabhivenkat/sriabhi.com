"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getPhotoUrls } from "../../functions/abhiPcCalls";
import { count } from "console";

const MapComponent = dynamic(() => import("../components/MapComponent"), { ssr: false });

export interface Tab {
  title: string;
  markers?: { latitude: number; longitude: number; color?: string, city?: string, grabPath?: string, photoPaths?: string[]}[];
}
export default function Home() {
  const texts = [
    "Here's some stuff I've been up to.",
  ];
  const tabMetadata = [
    {
      "title": "Photos",
      "markers": [
        // tokyo: 
        { latitude: 35.6762, longitude: 139.6503, color: "red", grabPath: "trips/japan", city: "Tokyo", country: "JP"},
        // nyc
        { latitude: 40.7128, longitude: -74.006, color: "blue", grabPath: "trips/nyc", city: "New York City", country: "USA"},
        // banff national park
        { latitude: 51.1784, longitude: -115.5708, color: "green", grabPath: "trips/banff", city: "Banff", country: "CA"},
        // yosemite national park
        { latitude: 37.8651, longitude: -119.5383, color: "yellow", grabPath: "trips/yosemite", city: "Yosemite", country: "USA"},
        // dallas
        { latitude: 32.7767, longitude: -96.7970, color: "purple", grabPath: "trips/dallas", city: "Dallas", country: "USA"},
        // ketchikan
        { latitude: 55.3422, longitude: -131.6461, color: "orange", grabPath: "trips/alaska", city: "Ketchikan", country: "USA"},
        // mt rainier
        { latitude: 46.8523, longitude: -121.7603, color: "pink", grabPath: "trips/rainier", city: "Mount Rainier", country: "USA"},
        // austin
        { latitude: 30.2672, longitude: -97.7431, color: "cyan", grabPath: "trips/austin", city: "Austin", country: "USA"},
      ]
    },
    {
      "title": "Hikes",
    }
  ]

  const [textIndex, setTextIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"fade-in" | "fade-out">("fade-in");
  const [showMap, setShowMap] = useState(false);
  const [moveUp, setMoveUp] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>(tabMetadata);
  const [currTab, setCurrTab] = useState<Tab | null>(null);


  useEffect(() => {
    async function populatePhotoPaths() {
      const updatedTabs = await Promise.all(
        tabs.map(async (tab) => {
          if (!tab.markers) return tab;

          const updatedMarkers = await Promise.all(
            tab.markers.map(async (marker) => {
              if (!marker.grabPath) return marker;

              try {
                const res = await fetch(`/api/get-photo-urls?subfolder=${encodeURIComponent(marker.grabPath)}`);
                if (!res.ok) throw new Error(`Failed to fetch photos for ${marker.grabPath}`);
                const photoPaths: string[] = await res.json();

                // Take only the first 5 photos
                return { ...marker, photoPaths: photoPaths.slice(0, 5) };
              } catch (err) {
                console.error(err);
                return { ...marker, photoPaths: [] };
              }
            })
          );

          return { ...tab, markers: updatedMarkers };
        })
      );

      setTabs(updatedTabs);
      setCurrTab(updatedTabs[0] || null); // set first tab immediately
    }

    populatePhotoPaths();
  }, []);


  useEffect(() => {
    // Instantly move text up and show the map
    setTimeout(() => {
      setMoveUp(true);
      setShowMap(true);
    }, 250);
  }, []);

  return (
    <div className="relative bg-black text-white min-h-screen w-screen">
      {/* --- Fixed Header --- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-transparent flex justify-start items-center py-3 px-6">
        <h1 className="text-lg sm:text-xl font-sans text-white tracking-wide">
          Oshalabs
        </h1>
      </header>

      {/* --- Hero Section (Text + Map) --- */}
      <div className="relative h-screen w-full flex flex-col items-center justify-center">
        {/* Map container */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 flex flex-col items-center justify-center ${
            showMap ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <MapComponent
             markers={currTab?.markers}
          />
        </div>


        {/* Text overlay */}
        <div
          className={`absolute z-10 text-center transition-all duration-1000 ease-in-out ${
            moveUp
              ? "top-[5vh] scale-90"
              : "top-1/2 -translate-y-1/2 scale-100"
          }`}
        >
          {!showMap && ( <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans mb-3"> This is lowk for my server, but </h1> )}
          <h2
            className={`text-lg sm:text-xl md:text-3xl font-light font-sans transition-opacity duration-1000 ${
              fadeState === "fade-in" ? "opacity-100" : "opacity-0"
            }`}
          >
            {texts[textIndex] || "Here's some stuff I've been up to."}
          </h2>
          {/* Create tab list of photos */}
          {showMap && (

            <div className="mt-6 flex space-x-4 justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.title}
                  className={`px-4 py-2 rounded-xl border ${
                    currTab?.title === tab.title
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-gray-400 hover:border-white"
                  } transition-colors duration-300`}
                  onClick={() =>
                    // set curr tab to the tab in tabs if it's not already selected, else set to null
                    setCurrTab(tab)
                  }
                >
                  {tab.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Next Section --- */}
      <section className="w-full min-h-[600px] bg-black flex items-center justify-center border-t border-gray-800">
        <p className="text-gray-400 text-center">More sections coming soon...</p>
      </section>
    </div>
  );
}