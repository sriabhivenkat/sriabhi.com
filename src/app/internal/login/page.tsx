"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Login from "@/components/Login";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Login
      onLoginSuccess={() => {
        const redirect = searchParams.get("redirect");
        router.replace(redirect && redirect.startsWith("/internal") ? redirect : "/internal");
      }}
    />
  );
}

export default function InternalLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
