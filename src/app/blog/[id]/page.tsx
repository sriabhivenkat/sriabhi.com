// app/blog/[id]/page.tsx
import { Metadata } from "next";
import { getAccessToken } from "../../../../functions/abhiPcCalls";
import BlogPostClient from "@/components/BlogPostClient";

interface Post {
  file_url: string;
  title?: string;
  subtitle?: string;
  cover_photo?: string;
  minute_read?: number;
  date_created?: Date;
  id: string;
}

// Generate metadata for link previews
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const { access_token } = await getAccessToken();
    
    const res = await fetch("https://home.sriabhi.com/api/v1/list_files", {
      headers: { Authorization: `Bearer ${access_token}` },
      // Add cache revalidation if needed
      next: { revalidate: 3600 }
    });

    const data = await res.json();
    const post = data.find((p: any) => p.id === id);

    if (!post) {
      return {
        title: "Post Not Found",
      };
    }

    return {
      title: post.title || "Blog Post",
      description: post.subtitle || "",
      openGraph: {
        title: post.title || "Blog Post",
        description: post.subtitle || "",
        images: post.cover_photo ? [
          {
            url: post.cover_photo,
            width: 1200,
            height: 630,
            alt: post.title || "Blog post cover image",
          }
        ] : [],
        type: "article",
        publishedTime: post.date_created ? new Date(post.date_created).toISOString() : undefined,
        authors: ["Sriabhi Venkat"],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title || "Blog Post",
        description: post.subtitle || "",
        images: post.cover_photo ? [post.cover_photo] : [],
        creator: "@yourtwitterhandle", // Add your Twitter handle
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog Post",
    };
  }
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  
  return <BlogPostClient id={id} />;
}