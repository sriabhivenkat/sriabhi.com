// app/photos/[path]/page.tsx
import Collection from "@/components/Collection";
import { Metadata } from "next";

// Map path slugs to readable names
const PATH_NAMES: Record<string, string> = {
  "banff": "Banff",
  "dallas": "Dallas",
  "nyc": "New York City",
  "japan": "Japan",
  "yosemite": "Yosemite",
  "alaska": "Alaska",
  "rainier": "Mount Rainier",
  "austin": "Austin",
  "nola": "New Orleans",
  "cold_springs": "Cold Springs",
  "oklahoma": "Lake Murray State Park",
  "new_mexico": "New Mexico"
};
const BASE_URL = "https://home.sriabhi.com";
// Static metadata for link previews
export async function generateMetadata(
  { params }: { params: Promise<{ path: string }> }
): Promise<Metadata> {
  const { path } = await params;
  console.log("PATH: ", path)
  const locationName = PATH_NAMES[path] || path;
  const coverUrl = `${BASE_URL}/api/v1/photo/cover_photos/${path}_cover_thumb.webp`;
  console.log("COVER URL: ", coverUrl)
  return {
    title: `${locationName} Gallery`,
    description: `Photo collection from ${locationName}`,
    openGraph: {
      title: `${locationName} Gallery`,
      description: `Photo collection from ${locationName}`,
      type: "website",
      images: [
        {
          url: coverUrl,
          width: 1200,
          height: 630,
          alt: "cover image",
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${locationName} Photos`,
      description: `Photo collection from ${locationName}`,
      images: [coverUrl],
    },
  };
}

export default async function Page(props: { params: Promise<{ path: string }> }) {
  const { path } = await props.params;
  
  return <Collection path={path} />;
}