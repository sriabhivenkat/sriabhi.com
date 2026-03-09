"use client";
import React, { useEffect, useState, useRef } from "react";
import { getAccessToken, getStoredAccessToken } from "../../../../functions/abhiPcCalls";
import Login from "@/components/Login";
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from "@mui/x-charts";
import { ChartCandlestick, Home, LucideArrowDownRightFromCircle, LucideArrowRightCircle, LucideArrowUpRightFromCircle, PiggyBank, Receipt, RotateCw } from "lucide-react";
import Link from "next/link";
import FinanceDashboard from "@/components/FinanceDashboard";
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
    const main = async() => {
        const { access_token } = await getAccessToken();
        console.log("Access Token:", access_token);
        // Fetch accounts using the access token
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
  },[])

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

            // ----- map of date -> transactions -----
            const dateToTransactions: Record<string, any[]> = transactions.reduce(
                (acc: Record<string, any[]>, tx: any) => {
                    const dateKey = tx.transDate.slice(0, 10); // YYYY-MM-DD
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(tx);
                    return acc;
                },
                {}
            );
            setTransactionsByDay(dateToTransactions)

            // ----- burn-down array with exclusions & no negatives -----
            const maxSpend = 1500; // starting max
            const sortedDates = Object.keys(dateToTransactions).sort();

            const burnArray: number[] = [1500];
            let remaining = maxSpend;
            console.log(dateToTransactions)
            sortedDates.forEach((date) => {
                // sum only transactions that are NOT from Mountaindeerf
                const dailySpend = dateToTransactions[date]
                .filter(
                    (tx) => tx.account.officialName === "Venture X" 
                    && !["CAPITAL ONE MOBILE PYMT", "COT"].includes(tx?.merchant?.officialName)
                )
                .reduce((sum, tx) => sum + tx.amount, 0);
                console.log(date, dailySpend)
                remaining -= dailySpend;
                burnArray.push(remaining);
            });
            console.log(burnArray)
            setMonthlyBurnArray(burnArray)

            } catch (err) {
                console.error("Error fetching transactions:", err);
            }
        };

        main();
    }, []);


  return token ? (
    <div className="h-screen overflow-hidden bg-black flex p-2">
        <div
            className="
                w-1/6 rounded-lg p-3 h-full
                        bg-white/10
                        backdrop-blur-lg
                        border border-white/20
                        shadow-xl
            "
        >
            <h1
                className="font-serif-custom text-3xl mb-8"
            >
                Bookkeeper
            </h1>
            <div
                className="flex flex-1 flex-col"
            >
                <div
                    className="w-full flex items-center hover:bg-gray-700 px-1 py-2 rounded-lg"
                    onClick={() => setPage("dashboard")}
                >
                    <Home 
                        color="white"
                        size={20}
                    />
                    <p className="ml-2 text-sm">
                        Home
                    </p>
                </div>
                <div
                    className="w-full flex items-center mt-2 hover:bg-gray-700 px-1 py-2 rounded-md"
                    onClick={() => setPage("accounts")}
                >
                    <PiggyBank
                        color="white"
                        size={20}
                    />
                    <p className="ml-2 text-sm">
                        Accounts
                    </p>
                </div>
                <Link
                    href="/"
                    className="w-full flex items-center mt-2 hover:bg-gray-700 px-1 py-2 rounded-md"
                >
                    <Receipt
                        color="white"
                        size={20}
                    />
                    <p className="ml-2 text-sm">
                        Transactions
                    </p>
                </Link>
                <Link
                    href="/"
                    className="w-full flex items-center mt-2 hover:bg-gray-700 px-1 py-2 rounded-md"
                >
                    <ChartCandlestick
                        color="white"
                        size={20}
                    />
                    <p className="ml-2 text-sm">
                        Investments
                    </p>
                </Link>
                <Link
                    href="/"
                    className="w-full flex items-center mt-2 hover:bg-gray-700 px-1 py-2 rounded-md"
                >
                    <RotateCw
                        color="white"
                        size={20}
                    />
                    <p className="ml-2 text-sm">
                        Recurring
                    </p>
                </Link>
            </div>
        </div>
        <div
            className="w-5/6 bg-[#141414] rounded-lg ml-2 p-3 flex flex-col min-h-0 overflow-y-auto"
        >
            {page === "dashboard" &&
                <FinanceDashboard 
                    monthlyBurnArray={monthlyBurnArray}
                    netWorth={netWorth}
                    temporalNW={temporalNW}
                    setPage={setPage}
                />
            }
            {page === "accounts" &&
                <FinanceAccountsPage 
                    accounts={accounts as Account[]}
                />
            }
        </div>
    </div>
  ) : (
    <Login onLoginSuccess={(t) => setToken(t)} />
  )
}