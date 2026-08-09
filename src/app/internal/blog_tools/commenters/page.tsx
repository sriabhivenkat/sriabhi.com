"use client";
import React, {useEffect, useState} from "react";
import DashNav from "@/components/DashNav";
import { getAccessToken } from "../../../../../functions/abhiPcCalls";

type CommenterStatus = "unverified" | "pending" | "approved" | "blocked";

interface Commenter {
  commenter_id: string; // UUID
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  status: CommenterStatus;
  requested_at: string | null; // ISO 8601
  verified_at: string | null;
  decided_at: string | null;
  created_at: string | null;
}

export default function Commenters() {
    const [commenters, setCommenters] = useState<Commenter[]>([]);

    async function decideCommenter(commenterId: string, decision: "approve" | "block" | "unblock") {
        const { access_token } = await getAccessToken();

        const url =
            decision === "approve"
            ? `https://home.sriabhi.com/api/v1/approve_commenter/${commenterId}`
            : `https://home.sriabhi.com/api/v1/block_commenter/${commenterId}`;

        const res = await fetch(url, {
            method: "POST",
            headers: {
            Authorization: `Bearer ${access_token}`,
            ...(decision !== "approve" ? { "Content-Type": "application/json" } : {}),
            },
            ...(decision === "block" ? { body: JSON.stringify({ action: "BLOCK" }) } : {}),
            ...(decision === "unblock" ? { body: JSON.stringify({ action: "UNBLOCK" }) } : {}),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.error ?? `Request failed (${res.status})`);
        }
    }

    function setCommenterStatus(
        setCommenters: React.Dispatch<React.SetStateAction<Commenter[]>>,
        commenterId: string,
        status: CommenterStatus
    ) {
        setCommenters((prev) =>
            prev.map((p) => (p.commenter_id === commenterId ? { ...p, status } : p))
        );
    }

    useEffect(() => {
        const main = async() => {
            const { access_token } = await getAccessToken();
            await fetch(`https://home.sriabhi.com/api/v1/get_commenters`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                setCommenters(data)
            })
            .catch((e) => console.log("Error: ", e))
        }
        main()
    }, [])

    function initials(first: string | null, last: string | null) {
        const f = first?.[0] ?? "";
        const l = last?.[0] ?? "";
        return (f + l).toUpperCase() || "?";
    }   
    return (
            <div className="min-h-screen lg:h-screen lg:overflow-hidden
                     bg-[#F4F2F3]
                     flex flex-col items-center p-2"
            >
                <DashNav />
                <div className="mt-12 w-full rounded-2xl bg-white border border-neutral-200/70 shadow-sm p-4">
                    <div className="flex items-baseline justify-between mb-3">
                        <h3 className="text-xl font-serif-custom font-light text-black">
                            All commenters
                        </h3>
                        {commenters.length > 0 && (
                            <span className="text-xs text-neutral-400">{commenters.length} waiting</span>
                        )}
                    </div>

                    {commenters.length === 0 ? (
                        <p className="text-sm text-neutral-400 py-6 text-center">
                            No one's waiting on approval right now.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                        {commenters.map((c) => (
                            <div
                                key={c.commenter_id}
                                className="w-full sm:w-[220px] rounded-xl border border-neutral-200 p-3 flex flex-col gap-2"
                            >
                                <div className="flex items-center gap-2">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-[#3D2B2E]/10 text-[#3D2B2E] flex items-center justify-center text-xs font-semibold">
                                    {initials(c.first_name, c.last_name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-black truncate">
                                    {c.first_name} {c.last_name}
                                    </p>
                                    <p className="text-xs text-neutral-500 truncate">{c.email}</p>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                                    c.status === "approved"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : c.status === "blocked"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-neutral-100 text-neutral-500"
                                    }`}
                                >
                                    {c.status}
                                </span>
                                </div>

                                <p className="text-[11px] text-neutral-400">
                                Requested {c.requested_at ? new Date(c.requested_at).toLocaleString() : "—"}
                                </p>

                                <div className="flex items-center gap-1.5 mt-1">
                                {c.status === "pending" && (
                                    <button
                                    onClick={async () => {
                                        const previous = commenters;
                                        setCommenterStatus(setCommenters, c.commenter_id, "approved");
                                        try {
                                        await decideCommenter(c.commenter_id, "approve");
                                        } catch (e) {
                                        console.error(e);
                                        setCommenters(previous);
                                        }
                                    }}
                                    className="flex-1 rounded-full px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                    >
                                    Approve
                                    </button>
                                )}

                                {c.status !== "blocked" ? (
                                    <button
                                    onClick={async () => {
                                        const previous = commenters;
                                        setCommenterStatus(setCommenters, c.commenter_id, "blocked");
                                        try {
                                        await decideCommenter(c.commenter_id, "block");
                                        } catch (e) {
                                        console.error(e);
                                        setCommenters(previous);
                                        }
                                    }}
                                    className={`${
                                        c.status === "pending" ? "flex-1" : "w-full"
                                    } rounded-full px-2 py-1 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors`}
                                    >
                                    Block
                                    </button>
                                ) : (
                                    <button
                                    onClick={async () => {
                                        const previous = commenters;
                                        setCommenterStatus(setCommenters, c.commenter_id, "approved");
                                        try {
                                        await decideCommenter(c.commenter_id, "unblock");
                                        } catch (e) {
                                        console.error(e);
                                        setCommenters(previous);
                                        }
                                    }}
                                    className="w-full rounded-full px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
                                    >
                                    Unblock
                                    </button>
                                )}
                                </div>
                            </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
    )
}