"use client";
import * as React from "react";
import { useState, useMemo } from "react";
import Map from "react-map-gl/mapbox";
// @ts-ignore
import "mapbox-gl/dist/mapbox-gl.css";
import { Marker, Popup } from "react-map-gl/mapbox";
import Pin from "./Pin";

// const accessToken = process.env.AUTH_TOKEN_MAPBOX_TOKEN!; // prod
const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN! // dev
interface MarkerType {
  latitude: number;
  longitude: number;
  color?: string;
  city?: string;
  country?: string;
  grabPath?: string;
  photoPaths?: string[];
}

interface MapComponentProps {
  markers?: MarkerType[];
}



export default function MapComponent({ markers = [] }: MapComponentProps) {
  
  const [popupInfo, setPopupInfo] = useState<MarkerType | null>(null);
  const pins = useMemo(
    () =>
      markers.map((marker, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            console.log('Marker clicked:', marker);
            setPopupInfo(marker);
          }}
        >
          <Pin />
        </Marker>
      )),
    [markers]
  );

  return (
    <Map
      initialViewState={{
        longitude: -98.5795,
        latitude: 39.8283,
        zoom: 3.2,
      }}
      style={{ width: "80vw", height: "80vh", borderRadius: "12px", marginTop: "150px" }}
      mapStyle="mapbox://styles/kastech/cmhsf9202002s01s9h22ndwoe"
      mapboxAccessToken={accessToken}
      attributionControl={false}
    >
      {pins}
      {popupInfo && (
        <Popup
          anchor="top"
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          onClose={() => setPopupInfo(null)}
        >
          <div className="rounded-md p-2 max-w-[250px]">
            {popupInfo.city && popupInfo.country && (
              <p className="font-semibold mb-2 text-black text-lg">{popupInfo.city}, {popupInfo.country}</p>
            )}

            {/* Photo grid */}
            <div className="grid grid-cols-2 gap-2 scrollbar-hidden max-h-48 overflow-y-auto">
              {popupInfo.photoPaths
                ?.slice(0, 20) // ✅ only first 5 photos
                .map((path, idx) => (
                  <img
                    key={idx}
                    src={path}
                    alt={`photo ${idx}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                ))}
            </div>

            {/* Show count if there are more */}
            {popupInfo.photoPaths && popupInfo.photoPaths.length > 20 ? (
              <p className="text-xs text-gray-500 mt-2">
                +{popupInfo.photoPaths.length - 20} more photos. View more <a>here.</a>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                {popupInfo.photoPaths?.length || 0} photos. View more <a>here.</a>
              </p>
            )}
          </div>
        </Popup>
      )}

    </Map>
  );
}
