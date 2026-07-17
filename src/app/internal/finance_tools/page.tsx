    "use client";
    import React, { useEffect, useState, useRef, useMemo } from "react";
    import { getAccessToken, getStoredAccessToken } from "../../../../functions/abhiPcCalls";
    import Login from "@/components/Login";
    import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
    import { ChartsReferenceLine } from "@mui/x-charts";
    import { ChartCandlestick, ClipboardClock, Cog, LucideArrowDownRightFromCircle, LucideArrowUpRightFromCircle, NotebookTabs, PiggyBank, Receipt } from "lucide-react";
    import Link from "next/link";
    import FinanceAccountsPage, { Account } from "@/components/FinanceAccountsPage";

    export default function Page() {
    const [token, setToken] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    useEffect(() => {
        const t = getStoredAccessToken();
        setToken(t);
        setChecked(true);
    }, []);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [netWorth, setNetWorth] = useState<number>(0);
    const [creditCardDebt, setCreditCardDebt] = useState<number>(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [transactionsByDay, setTransactionsByDay] = useState<any>();
    const [monthlyBurnArray, setMonthlyBurnArray] = useState<any[]>([]);
    const [temporalNW, setTemporalNW] = useState<any[]>([]);
    const [page, setPage] = useState<string>("dashboard");

    useEffect(() => {
        const main = async () => {
        const { access_token } = await getAccessToken();
        console.log("Access Token:", access_token);
        await fetch('https://home.sriabhi.com/api/v1/get_accounts', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
            }
        })
            .then((res) => res.json())
            .then((data) => {
            console.log("Accounts Data:", data);
            setAccounts(data || []);
            const filtered = data.filter(
                (acc: any) => acc.institution_name !== "Citibank"
            );

            const liabilities = filtered
                .filter((acc: any) => acc.subtype === "credit card")
                .reduce(
                (sum: number, acc: any) => sum + (acc.current_balance ?? 0),
                0
                );

            const assets = filtered
                .filter((acc: any) => acc.subtype !== "credit card")
                .reduce(
                (sum: number, acc: any) => sum + (acc.current_balance ?? 0),
                0
                );
            setNetWorth(assets - liabilities);
            setCreditCardDebt(liabilities);
            })

        await fetch("https://home.sriabhi.com/api/v1/get_temporal_net_worth", {
            method: "GET",
            headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
            }
        })
            .then((res) => res.json())
            .then((data) => {
            console.log("TEMP NW: ", data)
            setTemporalNW(data)
            })
        }

        main();
    }, [])

    const getCurrentDateRange = () => {
        const date = new Date();
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const format = (d: Date) => d.toISOString().slice(0, 10);
        return {
        startDate: format(startDate),
        endDate: format(endDate),
        };
    };
    const lastMonthNW = temporalNW.filter((item) => {
        const itemDate = new Date(item.date);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return itemDate >= cutoff;
    });
    const lastDayTransactions = useMemo(() => {
        if (transactions.length === 0) return [];

        const mostRecentDate = transactions.reduce((latest: string, tx: any) => {
            const txDay = tx.transDate.slice(0, 10);
            return txDay > latest ? txDay : latest;
        }, transactions[0].transDate.slice(0, 10));

        return transactions.filter((tx: any) => tx.transDate.slice(0, 10) === mostRecentDate);
    }, [transactions]);
    console.log("LST: ", lastDayTransactions)
    const tiles = [
        {
            "title": "Accounts",
            icon: () => <PiggyBank size={30} color="#143109" />,
            content: () => {
                const institutionCounts = accounts.reduce((acc: Record<string, number>, account: any) => {
                    const name = account.institution_name;
                    acc[name] = (acc[name] || 0) + 1;
                    return acc;
                }, {});

                return (
                    <div key={0} className="flex flex-1 flex-col sm:flex-row w-full h-full items-center justify-center sm:justify-between gap-4 p-1">
                        <div className="flex sm:flex-row justify-center items-center sm:ml-2">
                            <h1 className="sm:text-5xl text-5xl font-black">{accounts.filter((i) => !['Wealthfront', 'Citibank'].includes(i.institution_name)).length}</h1>
                            <h1 className="sm:text-lg text-xl font-serif-custom text-lg ml-2">accounts</h1>
                        </div>
                        <div className="hidden sm:flex flex-row items-center sm:items-end gap-1">
                            {Object.entries(institutionCounts).filter((i) => !['Wealthfront', 'Citibank'].includes(i[0])).map(([institution, count], index) => (
                                <div key={index} className={`flex flex-col items-center ${index != 0 && 'border-l-1'} border-gray-200 p-1`}>
                                    <p className="text-xs sm:text-2xl font-black text-[#3D2B2E]">
                                        {count}
                                    </p>
                                    <p className="text-xs sm:text-lg font-serif-custom text-black/70">
                                        {institution}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
        },
        {
            "title": "Transactions",
            icon: () => <Receipt size={30} color="#9999C3" />,
            content: () => {
                const rawSum = lastDayTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);
                const sumVal = rawSum.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
                const monthly = transactions.filter((tx: any) => {
                    const txDate = new Date(tx.transDate);
                    const now = new Date();
                    return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
                }).reduce((sum: number, tx: any) => sum + tx.amount, 0);
                return(
                    <div key={1} className="flex flex-1 flex-row w-full h-full items-center justify-center gap-4 p-1">
                        <div className="flex flex-col items-center">
                            <h1
                                className={`font-black sm:text-3xl text-2xl ${rawSum > 30 ? "text-[#ef4444]/80" : 'text-[#22c55e]'}`}
                            >
                                {sumVal}
                            </h1>
                            <h1
                                className={`font-serif-custom sm:text-xl`}
                            >
                                Spent {new Date(lastDayTransactions[0]?.transDate).toLocaleDateString()}
                            </h1>
                        </div>
                        <div className="hidden sm:flex flex-col items-center">
                            <h1
                                className={`font-black sm:text-3xl text-2xl`}
                            >
                                {monthly.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                            </h1>
                            <h1
                                className={`font-serif-custom sm:text-xl`}
                            >
                                Spent this month
                            </h1>
                        </div>
                    </div>
                )
            }
        },
        {
            "title": "Reports",
            icon: () => <ClipboardClock size={30} color="#A98743" />,
            content: () => {
                const daysRemaining = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()
                return(
                    <div key={2} className="flex flex-1 flex-row w-full h-full items-center justify-center gap-4 p-1">
                        <div className="flex flex-col items-center">
                            <h1
                                className={`font-black sm:text-3xl text-2xl`}
                            >
                                {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                            </h1>
                            <h1
                                className={`font-serif-custom sm:text-xl`}
                            >
                                Until next report
                            </h1>
                        </div>
                    </div>
                )
            }
        },
        {
            "title": "Investments",
            icon: () => <ChartCandlestick size={30} color="#DE8F6E" />,
            content: () => {
                const investments = accounts.filter((a) => a.type === 'investment').reduce((sum: any, acc: Account) => sum + acc.current_balance, 0)
                return(
                    <div key={2} className="flex flex-1 flex-row w-full h-full items-center justify-center gap-4 p-1">
                        <div className="flex flex-col items-center">
                            <h1
                                className={`font-black sm:text-3xl text-2xl`}
                            >
                                {investments.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} 
                            </h1>
                            <p>
                                ({((investments / netWorth) * 100).toFixed(2)}%) <span className={`font-serif-custom sm:text-xl`}>In investments</span>
                            </p>
                        </div>
                    </div>
                )
            }
        },
        {
            "title": "Budgets",
            icon: () => <NotebookTabs size={30} color="#553D36" />
        },
        {
            "title": "Modify Options",
            icon: () => <Cog size={30} color="#3D2B2E" />
        }
    ]

    useEffect(() => {
        const main = async () => {
        const { startDate, endDate } = getCurrentDateRange();
        console.log("GRAPHQL EFFECT RAN", startDate, endDate);

        const query = `
        query Transactions($start: Date!, $end: Date!) {
            transactions(start: $start, end: $end) {
                transId
                amount
                category
                transDate
                channel
                merchant {
                    officialName
                    logoUrl
                }
                account {
                    officialName
                    mask
                    institutionName
                }
            }
        }
        `;

        try {
            const res = await fetch("https://home.sriabhi.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query,
                variables: { start: startDate, end: endDate },
            }),
            });

            const transData = await res.json();
            const transactions = transData?.data?.transactions ?? [];
            setTransactions(transactions);

            const dateToTransactions: Record<string, any[]> = transactions.reduce(
            (acc: Record<string, any[]>, tx: any) => {
                const dateKey = tx.transDate.slice(0, 10);
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(tx);
                return acc;
            },
            {}
            );
            setTransactionsByDay(dateToTransactions)

            const maxSpend = 1500;
            const sortedDates = Object.keys(dateToTransactions).sort();

            const burnArray: number[] = [1500];
            let remaining = maxSpend;
            sortedDates.forEach((date) => {
            const dailySpend = dateToTransactions[date]
                .filter(
                (tx) => tx.account.officialName === "Venture X"
                    && !["CAPITAL ONE MOBILE PYMT", "COT"].includes(tx?.merchant?.officialName)
                )
                .reduce((sum, tx) => sum + tx.amount, 0);
            remaining -= dailySpend;
            burnArray.push(remaining);
            });
            setMonthlyBurnArray(burnArray)

        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
        };

        main();
    }, []);

    return token ? (
        <div className="bg-[#F4F2F3] h-screen w-screen sm:overflow-hidden flex p-2">
            {page === "dashboard" && (
            <div className="flex flex-col w-full h-full">
                <div
                    className="w-full border-black flex justify-between"
                >
                    <div className="flex flex-col gap-0">
                        <h1 className="text-[#3D2B2E] font-serif-custom text-2xl sm:text-3xl leading-tight">
                            Bookkeeper
                        </h1>
                        <p
                            className="text-[#3D2B2E] font-serif-custom text-sm"
                        >
                            by sriabhi.com
                        </p>
                    </div>
                    <Link
                        href={'/internal'}
                        className="p-2 flex text-black text-xs items-center rounded-md hover:cursor-pointer bg-[#3D2B2E] text-white"
                    >
                        Return to dashboard
                    </Link>
                </div>
                <div className=" text-[#3D2B2E] flex-1 flex flex-col sm:grid sm:grid-cols-2 sm:grid-rows-2 gap-2 mt-2 min-h-0">

                {/* Burn Rate */}
                <div
                    className="
                    rounded-lg p-2 h-48 sm:h-full
                    bg-white/10
                    backdrop-blur-md
                    border border-white/20
                    shadow-lg
                    "
                >
                    <div className="flex flex-col h-full min-h-0 min-w-0">
                    <div className="w-full items-center flex justify-between flex-wrap gap-y-1">
                        <div className="flex flex-col justify-center">
                        <h2 className="font-serif-custom text-xl sm:text-2xl mb-1">
                            Burn Rate
                        </h2>
                        </div>
                    </div>
                    <div className="flex flex-1 w-full min-h-0 min-w-0">
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
                            area: true,
                            color: '#22c55e',
                            },
                        ]}
                        xAxis={[
                            {
                            dataKey: 'x',
                            disableTicks: true,
                            disableLine: true,
                            tickLabelStyle: { display: 'none', color:"#3D2B2E" },
                            },
                        ]}
                        yAxis={[
                            {
                            dataKey: 'y',
                            min: Math.min(0, ...monthlyBurnArray),
                            disableTicks: true,
                            disableLine: true,
                            tickLabelStyle: { fill: '#3D2B2E', fontSize: 11 },
                            },
                        ]}
                        margin={{ top: 10, right: 6, bottom: 4, left: 5 }}
                        grid={{ horizontal: false, vertical: false }}
                        sx={{
                            width: '100%',
                            [`& .${lineElementClasses.root}`]: {
                            stroke: "url(#burnGradient)",
                            strokeWidth: 2,
                            strokeLinecap: 'round',
                            },
                            '& .MuiAreaElement-root': {
                            fill: "url(#burnAreaFill)",
                            opacity: 0.5,
                            },
                        }}
                        >
                        <defs>
                            <linearGradient id="burnGradient" gradientTransform="rotate(90)">
                                <stop offset="0%" stopColor="#22c55e" />
                                <stop offset="60%" stopColor="#eab308" />
                                <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                            <linearGradient id="burnAreaFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        </LineChart>
                    </div>
                    </div>
                </div>

                    {/* Net Worth */}
                    <div
                        className="
                        rounded-lg p-2 h-48 sm:h-full
                        bg-white/10
                        backdrop-blur-md
                        border border-white/20
                        shadow-lg
                        "
                    >
                    <div className="flex flex-col h-full min-h-0 min-w-0">
                        <div className="w-full items-center flex justify-between flex-wrap gap-y-2">
                            <div className="flex flex-col justify-center">
                            <h2 className="font-serif-custom text-xl sm:text-2xl">
                                Total Net Worth
                            </h2>
                            <h2 className="text-xl sm:text-3xl font-black text-[#22c55e]">
                                ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            </div>
                            <div className="flex flex-col items-end">
                            <div className="flex items-center justify-items-center gap-x-2">
                                {lastMonthNW.length >= 2 && (() => {
                                    const current = lastMonthNW[lastMonthNW.length - 1].net_worth;
                                    const previous = lastMonthNW[lastMonthNW.length - 2].net_worth;
                                    const percentChange = ((current - previous) / previous) * 100;
                                    const isPositive = current > previous;

                                return isPositive ? (
                                    <div className="flex justify-items-center items-center px-2 py-1">
                                    <LucideArrowUpRightFromCircle
                                        color="#22c55e"
                                        size={20}
                                        className="mr-2 self-center"
                                    />
                                    <h2 className="text-sm text-[#22c55e]">
                                        Up {percentChange.toFixed(2)}%
                                    </h2>
                                    </div>
                                ) : (
                                    <div className="flex justify-items-center items-center px-2 py-1 rounded">
                                    <LucideArrowDownRightFromCircle
                                        color="#ef4444"
                                        size={20}
                                        className="mr-2 self-center"
                                    />
                                    <h2 className="text-sm text-[#ef4444]">
                                        Down {Math.abs(percentChange).toFixed(2)}%
                                    </h2>
                                    </div>
                                );
                                })()}
                            </div>
                            </div>
                        </div>
                        <div className="w-full items-center flex flex-1 justify-center min-h-0 min-w-0">
                            <LineChart
                            dataset={lastMonthNW.map((item) => ({
                                x: item.date,
                                y: item.net_worth,
                            }))}
                            series={[
                                {
                                dataKey: 'y',
                                showMark: false,
                                curve: 'monotoneX',
                                area: true,
                                color: '#22c55e',
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
                                disableLine: true,
                                disableTicks: true,
                                tickLabelStyle: { fill: '#3D2B2E', fontSize: 11 },
                                },
                            ]}
                            margin={{ top: 10, right: 6, bottom: 4, left: 5}}
                            grid={{ horizontal: false, vertical: false }}
                            sx={{
                                width: '100%',
                                [`& .${lineElementClasses.root}`]: {
                                stroke: "#22c55e",
                                strokeWidth: 2,
                                strokeLinecap: 'round',
                                },
                                '& .MuiAreaElement-root': {
                                fill: "url(#netWorthAreaFill)",
                                opacity: 0.5,
                                },
                            }}
                            >
                            <defs>
                                <linearGradient id="netWorthAreaFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            </LineChart>
                        </div>
                        </div>
                    </div>
                    <div
                        className="w-full sm:col-span-2 grid grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2 gap-2 sm:mb-3"
                    >
                        {tiles.map((tile, index) => (
                            <div 
                                key={index}
                                className="
                                    rounded-lg p-2 h-40 sm:h-full
                                    bg-white/10
                                    backdrop-blur-md
                                    border border-white/20
                                    shadow-lg
                                    my-2
                                    hover:cursor-pointer
                                    flex flex-col min-h-0
                                "
                            >
                                <div className="flex flex-row">
                                    {tile.icon()}
                                    <h1 className="font-serif-custom sm:text-2xl text-xl ml-2">
                                        {tile.title}
                                    </h1>
                                </div>
                                {tile.content && (
                                    <div className="flex-1 min-h-0 mt-2 flex items-center justify-center w-full">
                                        {tile.content()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
            </div>
            )}
        </div>
    ) : (
        <Login onLoginSuccess={(t) => setToken(t)} />
    )
    }