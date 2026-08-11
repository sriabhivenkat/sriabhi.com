"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredAccessToken } from "../../../functions/abhiPcCalls";

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/internal/login";
  const [authorized, setAuthorized] = useState(isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    if (getStoredAccessToken()) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      router.replace(`/internal/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, isLoginPage, router]);

  if (!authorized) return null;
  return <>{children}</>;
}
