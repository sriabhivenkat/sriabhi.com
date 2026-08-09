"use client";
import React, { useEffect, useState, useRef } from "react";
import Login from "@/components/Login";
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from "@mui/x-charts";
import { ChartCandlestick, Home, LucideArrowDownRightFromCircle, LucideArrowRightCircle, LucideArrowUpRightFromCircle, PiggyBank, Receipt, RotateCw } from "lucide-react";
import Link from "next/link";
import { getStoredAccessToken } from "../../functions/abhiPcCalls";

export interface Account {
    account_id: string;
    available_balance?: number;
    current_balance: number;
    institution_name: string;
    item_id: string;
    mask: string;
    official_name: string;
    subtype: string;
    type: string;
    last_updated: string;
}

interface AccountPageProps {
    accounts: Account[]
}

export default function FinanceAccountsPage({
    accounts
}: AccountPageProps) {

    const creditCardBackgrounds: Record<string, string> = { "Venture X": "some-color" };
    console.log("accounts: ", accounts)
    return(
        <>
            <h1
                className="font-serif-custom text-3xl"
            >
                Accounts
            </h1>
            <div
                className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 mt-2"
            >
               <div
                    className="
                        rounded-lg p-3 h-full
                        bg-white/10
                        backdrop-blur-md
                        border border-white/20
                        shadow-lg
                    "
               >
                    <div
                        className="flex flex-col justify-center"
                    >
                        <h2
                            className="font-serif-custom text-2xl mb-1"
                        >
                            Credit Cards
                        </h2>
                    </div>
                    <div className="flex flex-col border">
                        {accounts.filter(((item) => item.type === "credit" && item.institution_name !== "Citibank")).map((item, index) => (
                            <div
                                key={index}
                                className={`
                                    w-full bg-${creditCardBackgrounds[item.official_name]} px-1 py-2 flex
                                `}
                            >
                                <p>
                                    {item.official_name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div> 
                <div
                    className="
                        rounded-lg p-2 h-full
                        bg-white/10
                        backdrop-blur-md
                        border border-white/20
                        shadow-lg
                    "
               >
                    <div
                        className="flex flex-col justify-center"
                    >
                        <h2
                            className="font-serif-custom text-2xl mb-1"
                        >
                            Depositories
                        </h2>
                    </div>
                </div> 
                <div
                    className="
                        rounded-lg h-full p-2
                        bg-white/10
                        backdrop-blur-md
                        border border-white/20
                        shadow-lg
                    "
               >
                    <div
                        className="flex flex-col justify-center"
                    >
                        <h2
                            className="font-serif-custom text-2xl mb-1"
                        >
                            Investments
                        </h2>
                    </div>
                </div> 
            </div>
        </>
    )
}