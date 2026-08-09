"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type VerifyState = "verifying" | "success" | "expired" | "invalid" | "error";

export default function VerifyCommentAccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<VerifyState>("verifying");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("invalid");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `https://home.sriabhi.com/api/v1/verify_comment_access?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            credentials: "include", // required so the access-token cookie actually gets set
          }
        );

        if (res.status === 410) {
          setState("expired");
          return;
        }
        if (res.status === 404) {
          setState("invalid");
          return;
        }
        if (!res.ok) {
          setState("error");
          return;
        }

        setState("success");
      } catch (e) {
        console.error(e);
        setState("error");
      }
    };

    verify();
  }, [searchParams]);

  useEffect(() => {
    if (state !== "success") return;
    if (countdown === 0) {
      router.push("/blog");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, countdown, router]);

  return (
    <div className="min-h-screen bg-[#F4F2F3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg p-6 text-center">
        {state === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-[#3D2B2E] border-t-transparent animate-spin" />
            <h1 className="text-lg font-serif-custom font-bold text-black">
              Verifying...
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              One moment while we confirm your access.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <h1 className="text-lg font-serif-custom font-bold text-black">
              You&apos;re verified
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              I&apos;ll review your request soon. Taking you to the blog in {countdown}...
            </p>
            <Link
              href="/blog"
              className="inline-block mt-4 bg-[#3D2B2E] rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-[#6B4C51] transition-colors"
            >
              Go now
            </Link>
          </>
        )}

        {state === "expired" && (
          <>
            <h1 className="text-lg font-serif-custom font-bold text-black">
              Link expired
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              This verification link is no longer valid. Head back to the blog and request access again.
            </p>
            <Link
              href="/blog"
              className="inline-block mt-4 bg-[#3D2B2E] rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-[#6B4C51] transition-colors"
            >
              Back to blog
            </Link>
          </>
        )}

        {(state === "invalid" || state === "error") && (
          <>
            <h1 className="text-lg font-serif-custom font-bold text-black">
              Something went wrong
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {state === "invalid"
                ? "This verification link isn't valid."
                : "We couldn't verify your access right now. Please try again shortly."}
            </p>
            <Link
              href="/blog"
              className="inline-block mt-4 bg-[#3D2B2E] rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-[#6B4C51] transition-colors"
            >
              Back to blog
            </Link>
          </>
        )}
      </div>
    </div>
  );
}