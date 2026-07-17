"use client";
import React, { useEffect, useState, useRef } from "react";
import Login from "@/components/Login";
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from "@mui/x-charts";
import { LucideArrowDownRightFromCircle, LucideArrowRightCircle, LucideArrowUpRightFromCircle} from "lucide-react";

type TemporalNetWorthPoint = {
  date: string;
  net_worth: number;
};

interface FinanceDashboardProps {
  monthlyBurnArray: number[];
  netWorth: number;
  temporalNW: TemporalNetWorthPoint[];
  setPage: React.Dispatch<React.SetStateAction<string>>;
}

export default function FinanceDashboard({
  monthlyBurnArray,
  netWorth,
  temporalNW,
  setPage
}: FinanceDashboardProps) {
    return(
        <div className='flex w-screen h-screen'>
                    <h1
                        className="font-serif-custom text-3xl"
                    >
                        Dashboard
                    </h1>
                    <div
                        className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 mt-2"
                    >
                        <div
                            className="
                                rounded-lg p-2 h-full
                                bg-white/10
                                backdrop-blur-md
                                border border-white/20
                                shadow-lg
                                col-span-2
                            "
                        >
                            <div
                                className="flex flex-col justify-center"
                            >
                                <h2
                                    className="font-serif-custom text-2xl mb-1"
                                >
                                    Budget Breakdown
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
                            <div className="w-full items-center flex justify-between">
                                <div
                                    className="flex flex-col justify-center"
                                >
                                    <h2
                                        className="font-serif-custom text-2xl mb-1"
                                    >
                                        Burn Rate
                                    </h2>
                                </div>
                                <button className="flex items-center gap-x-2 px-2 py-1 rounded border border-white/30 hover:bg-white/10 transition-colors">
                                    <span
                                        className="text-xs"
                                    >
                                        Transactions
                                    </span>
                                    <LucideArrowRightCircle 
                                        color="white"
                                        size={20}
                                    />
                                </button>
                            </div>
                            <div
                                className="flex flex-1"
                            >
                                <LineChart
                                    dataset={monthlyBurnArray.map((value, index) => ({
                                        x: index,
                                        y: value,
                                    }))}
                                    series={[
                                        {
                                            dataKey: 'y',
                                            showMark: false,
                                            curve: 'monotoneX',
                                        },
                                    ]}
                                    xAxis={[
                                        {
                                            dataKey: 'x',
                                            disableTicks: true,
                                            disableLine: true,
                                            tickLabelStyle: { display: 'none' },
                                        },
                                    ]}
                                    yAxis={[
                                        {
                                            dataKey: 'y',
                                            min: Math.min(0, ...monthlyBurnArray),
                                            disableTicks: true,
                                            tickLabelStyle: { fill: 'gray' },
                                            labelStyle: {fill: "white"}
                                        },
                                    ]}
                                    grid={{ horizontal: false, vertical: false }}
                                    height={300}
                                    sx={{
                                        "& .MuiChartsAxis-root": {
                                            stroke: '#ffffff55',
                                        },
                                        [`& .${lineElementClasses.root}`]: {
                                            stroke: "url(#burnGradient)",
                                            strokeWidth: 6,
                                        },
                                        "& .MuiChartsReferenceLine-root": {
                                            stroke: 'gray',
                                            strokeWidth: 4,
                                            strokeDasharray: '10 5',
                                        },
                                        "& .MuiChartsAxis-left .MuiChartsAxis-line": {
                                            stroke: 'gray', // Specifically target y-axis line
                                            strokeDasharray: '10 5',
                                            strokeWidth: 2
                                        },
                                    }}
                                    >
                                    <defs>
                                        <linearGradient id="burnGradient" gradientTransform="rotate(90)">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="60%" stopColor="#eab308" />
                                            <stop offset="100%" stopColor="#ef4444" />
                                        </linearGradient>
                                    </defs>
                                    <ChartsReferenceLine 
                                        y={0} 
                                        lineStyle={{
                                            stroke: "gray", // Use stroke instead of color
                                            strokeWidth: 2,
                                        }}
                                    />
                                </LineChart>
        
        
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
                            <div className="flex flex-col flex-1">
                                <div className="w-full items-center flex justify-between">
                                    <div
                                        className="flex flex-col justify-center"
                                    >
                                        <h2
                                            className="font-serif-custom text-2xl mb-1"
                                        >
                                            Total Net Worth
                                        </h2>
                                        <h2
                                            className="text-3xl font-black text-[#22c55e]"
                                        >
                                            ${netWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                            {/* $15,000 */}
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <button 
                                            className="mb-1 flex items-center gap-x-2 px-3 py-1 rounded border border-white/30 hover:bg-white/10 transition-colors"
                                            onClick={() => setPage("accounts")}
                                        >
                                            <span
                                                className="text-xs"
                                            >
                                                Accounts
                                            </span>
                                            <LucideArrowRightCircle 
                                                color="white"
                                                size={20}
                                            />
                                        </button>
                                    <div className="flex items-center justify-items-center gap-x-2">
                                        {temporalNW.length >= 2 && (() => {
                                            const current = temporalNW[temporalNW.length - 1].net_worth;
                                            const previous = temporalNW[temporalNW.length - 2].net_worth;
                                            const percentChange = ((current - previous) / previous) * 100;
                                            const isPositive = current > previous;
                                            
                                            return isPositive ? (
                                                <div className="flex justify-items-center items-center px-2 py-1">
                                                    <LucideArrowUpRightFromCircle 
                                                        color="#22c55e"
                                                        size={20}
                                                        className="mr-2 self-center"
                                                    />
                                                    <h2
                                                        className="text-sm text-[#22c55e]"
                                                    >
                                                        {percentChange.toFixed(2)}%
                                                    </h2>
                                                </div>
                                            ) : (
                                                <div className="flex justify-items-center items-center px-2 py-1 rounded">
                                                    <LucideArrowDownRightFromCircle 
                                                        color="#ef4444"
                                                        size={20}
                                                        className="mr-2 self-center"
                                                    />
                                                    <h2
                                                        className="text-sm text-[#ef4444]"
                                                    >
                                                        {Math.abs(percentChange).toFixed(2)}%
                                                    </h2>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                         
                                    </div>
                                </div>
                                <div className="w-full h-full items-center flex flex-1 justify-center min-h-0">
                                    <LineChart
                                        dataset={temporalNW.map((item) => ({
                                            x: item.date,
                                            y: item.net_worth,
                                        }))} 
                                        height={300}
                                        series={[
                                            {
                                                dataKey: 'y',
                                                showMark: false,
                                                curve: 'monotoneX',
                                            },
                                        ]}
                                        xAxis={[
                                            {
                                                dataKey: 'x',
                                                scaleType: 'band',
                                                disableLine: true,
                                                disableTicks: true,
                                                tickLabelStyle: { display: 'none' },
                                            },
                                        ]}
                                        yAxis={[
                                            {
                                                // disableLine: true,
                                                // disableTicks: true,
                                                tickLabelStyle: { fill: 'gray' },
                                            },
                                        ]}
                                        grid={{ horizontal: false, vertical: false }}
                                        sx={{
                                            [`& .${lineElementClasses.root}`]: {
                                                stroke: "#22c55e",
                                                strokeWidth: 6,
                                            },
                                            "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
                                                stroke: 'gray', // Specifically target y-axis line
                                                strokeDasharray: '10 5',
                                                strokeWidth: 2
                                            },
                                            "& .MuiChartsAxis-left .MuiChartsAxis-line": {
                                                stroke: 'gray', // Specifically target y-axis line
                                                strokeDasharray: '10 5',
                                                strokeWidth: 2
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
    )
}