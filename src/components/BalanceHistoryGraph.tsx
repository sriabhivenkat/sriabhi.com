"use client";

import React, { useEffect, useState } from "react";
import {
    LineChart,
    lineElementClasses
} from "@mui/x-charts";

type Snapshot = {
    officialName: string | null;
    currentBalance: number | null;
    snapshotAt: string;
};


export default function BalanceHistoryGraph({
    accountIds
}: {
    accountIds: string[]
}) {

    const [history, setHistory] = useState<Snapshot[]>([]);
    const [range, setRange] = useState("1M");

    useEffect(() => {

        const fetchHistory = async () => {

        const endDate = new Date();

        const startDate = new Date();

        switch (range) {
            case "1W":
                startDate.setDate(endDate.getDate() - 7);
                break;
            case "1M":
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case "6M":
                startDate.setMonth(endDate.getMonth() - 6);
                break;
            case "YTD":
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
        }

        const start = startDate.toISOString().slice(0, 10);
        const end = endDate.toISOString().slice(0, 10);
            const query = `
            query {
                balanceHistory(
                    start: "${start}",
                    end: "${end}",
                    accountIds: ${JSON.stringify(accountIds)}
                ) {
                    officialName
                    currentBalance
                    snapshotAt
                }
            }
            `;


            const res = await fetch(
                "https://home.sriabhi.com/graphql",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        query
                    })
                }
            );


            const json = await res.json();

            setHistory(json.data?.balanceHistory);

        };


        fetchHistory();

    }, [accountIds, range]);



    // Aggregate accounts by day
    const dataset = Object.values(
        history.reduce(
            (acc: any, snapshot) => {

                const date = snapshot.snapshotAt.slice(0,10);


                if (!acc[date]) {
                    acc[date] = {
                        date,
                        net_worth: 0
                    };
                }


                acc[date].net_worth +=
                    snapshot.currentBalance ?? 0;


                return acc;

            },
            {}
        )
    )
    .sort(
        (a:any,b:any)=>
            a.date.localeCompare(b.date)
    );



    return (
        <div className="w-full flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 w-full">
                <LineChart
                    dataset={dataset.map((item:any)=>({
                        x:item.date,
                        y:item.net_worth
                    }))}
                    height={undefined}
                    series={[
                        {
                            dataKey:'y',
                            showMark:false,
                            curve:'monotoneX',
                            area:true,
                            color:'#22c55e',
                        },
                    ]}

                    xAxis={[
                        {
                            dataKey:'x',
                            scaleType:'band',
                            disableLine:true,
                            disableTicks:true,
                            tickLabelStyle:{
                                display:'none'
                            },
                        },
                    ]}

                    yAxis={[
                        {
                            disableLine:true,
                            disableTicks:true,
                            tickLabelStyle:{
                                fill:'#3D2B2E',
                                fontSize:11
                            },
                        },
                    ]}

                    margin={{
                        top:10,
                        right:6,
                        bottom:4,
                        left:5
                    }}

                    grid={{
                        horizontal:false,
                        vertical:false
                    }}

                    sx={{
                        width: "100%",
                        height: "100%",

                        [`& .${lineElementClasses.root}`]: {
                            stroke:"#22c55e",
                            strokeWidth:2,
                            strokeLinecap:'round',
                        },

                        '& .MuiAreaElement-root': {
                            fill:"url(#balanceAreaFill)",
                            opacity:0.5,
                        },
                    }}
                >

                    <defs>
                        <linearGradient
                            id="balanceAreaFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#22c55e"
                                stopOpacity={0.4}
                            />

                            <stop
                                offset="100%"
                                stopColor="#22c55e"
                                stopOpacity={0}
                            />

                        </linearGradient>
                    </defs>
                </LineChart>
            </div>
            <div className="
                flex
                flex-row
                items-center
                justify-center
                gap-2
                py-2
                shrink-0
            ">
                {[
                    "1W",
                    "1M",
                    "6M",
                    'YTD'
                ].map((range)=>(
                    <button
                        key={range}
                        className="
                            bg-[#3D2B2E]
                            text-white
                            px-4
                            py-1
                            rounded-md
                            text-sm
                            hover:opacity-80
                            hover:cursor-pointer
                        "
                        onClick={() => setRange(range)}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
    );
}