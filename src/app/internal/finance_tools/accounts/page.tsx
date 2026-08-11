"use client";
import React, { useEffect, useState } from "react";
import DashNav from "@/components/DashNav";
import { Account } from "@/components/FinanceAccountsPage";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import BalanceHistoryGraph from "@/components/BalanceHistoryGraph";

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const banks: Record<string, string> = {
  "Capital One": "/images/capone.png",
  Vanguard: "/images/vanguard.png",
  Empower: "/images/empower.png",
};

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function timeAgo(lastUpdated: string) {
  const hours = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60)
  );
  if (hours <= 0) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function InstitutionMark({ name }: { name?: string }) {
  const src = name ? banks[name] : undefined;
  if (src) {
    return (
      <Image
        src={src}
        width={40}
        height={40}
        alt={name || "Institution"}
        className="h-10 w-10 shrink-0 rounded-full object-contain bg-white"
      />
    );
  }
  return (
    <div className="h-10 w-10 shrink-0 rounded-full bg-[#3D2B2E]/10 text-[#3D2B2E] flex items-center justify-center text-xs font-semibold">
      {initials(name)}
    </div>
  );
}

type BreakdownSegment = {
  key: string;
  label: string;
  amount: number;
  color: string;
};

function AssetsLiabilitiesBreakdown({
  bankTotal,
  investmentTotal,
  creditTotal,
}: {
  bankTotal: number;
  investmentTotal: number;
  creditTotal: number;
}) {
  const liabilities = Math.abs(creditTotal);
  const assetSegments: BreakdownSegment[] = [
    { key: "bank", label: "Bank Accounts", amount: Math.max(bankTotal, 0), color: "#3D2B2E" },
    { key: "invest", label: "Investments", amount: Math.max(investmentTotal, 0), color: "#8C6A5C" },
  ].filter((s) => s.amount > 0);

  const liabilitySegments: BreakdownSegment[] = [
    { key: "credit", label: "Credit Cards", amount: liabilities, color: "#C0673F" },
  ].filter((s) => s.amount > 0);

  const segments = [...assetSegments, ...liabilitySegments];
  const total = segments.reduce((sum, s) => sum + s.amount, 0);

  if (total === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-neutral-400">
        Link an account to see your assets and liabilities breakdown.
      </div>
    );
  }

  const assetsTotal = assetSegments.reduce((sum, s) => sum + s.amount, 0);
  const liabilitiesTotal = liabilitySegments.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-neutral-500">
          Assets{" "}
          <span className="font-semibold text-[#3D2B2E]">
            {currency(assetsTotal)}
          </span>
        </span>
        <span className="text-neutral-500">
          Liabilities{" "}
          <span className="font-semibold text-[#C0673F]">
            {currency(liabilitiesTotal)}
          </span>
        </span>
      </div>

      <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#3D2B2E]/10">
        {segments.map((s) => {
          const pct = (s.amount / total) * 100;
          return (
            <div
              key={s.key}
              title={`${s.label}: ${pct.toFixed(1)}%`}
              style={{ width: `${pct}%`, backgroundColor: s.color }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        {segments.map((s) => {
          const pct = (s.amount / total) * 100;
          return (
            <div
              key={s.key}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-[#3D2B2E] truncate">{s.label}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 tabular-nums">
                <span className="text-neutral-500">{currency(s.amount)}</span>
                <span className="text-[#3D2B2E] font-semibold w-12 text-right">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FinanceAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["bank"])
  );
  const [selectedAccount, setSelectedAccount] = useState<Account>();

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    const main = async () => {
      await fetch("/api/finance/accounts")
        .then((res) => res.json())
        .then((data) => {
          setAccounts(data || []);
          if (data.length > 0) {
            setSelectedAccount(data[0]);
          }
        })
        .catch((e) => console.error("Failed to load accounts:", e));
    };

    main();
  }, []);

  const bankaccts = accounts.filter(
    (acc: Account) =>
      acc.type === "depository" &&
      !["Wealthfront", "Citibank"].includes(acc.institution_name)
  );
  const credit = accounts.filter(
    (acc: Account) =>
      acc.type === "credit" &&
      !["Wealthfront", "Citibank"].includes(acc.institution_name)
  );
  const investment = accounts.filter(
    (acc: Account) =>
      acc.type === "investment" &&
      !["Wealthfront", "Citibank"].includes(acc.institution_name)
  );

  const mapSubtype = (subtype: string) => {
    if (subtype === "roth") return "Roth IRA";
    if (subtype === "401k") return "401K Retirement Savings";
    if (subtype === "brokerage") return "Brokerage";
    return subtype;
  };

  const renderAccountRow = (item: Account, index: number, sub: string) => {
    const isSelected = selectedAccount?.account_id === item.account_id;
    return (
      <button
        key={item.account_id ?? index}
        onClick={() => setSelectedAccount(item)}
        className={`w-full flex flex-row justify-between items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
          index !== 0 ? "mt-1" : ""
        } ${
          isSelected
            ? "bg-[#3D2B2E]/[0.06] ring-1 ring-[#3D2B2E]/15"
            : "hover:bg-[#3D2B2E]/[0.04]"
        }`}
      >
        <div className="flex flex-row items-center gap-3 min-w-0">
          <InstitutionMark name={item.institution_name} />
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-semibold text-[#3D2B2E] truncate">
              {item.official_name} <span className="text-xs text-gray-500 tabular-nums">(····{item.mask})</span>
            </h1>
            <p className="text-xs text-neutral-500">{sub}</p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <h1 className="text-sm font-semibold text-[#3D2B2E] tabular-nums">
            {currency(item.current_balance)}
          </h1>
          <p className="text-[11px] text-neutral-400 whitespace-nowrap">
            {timeAgo(item.last_updated)}
          </p>
        </div>
      </button>
    );
  };

  const accordions = [
    {
      title: "Bank Accounts",
      count: bankaccts.length,
      total: bankaccts.reduce((sum, acc) => sum + acc.current_balance, 0),
      toggleKey: "bank",
      empty: "No bank accounts linked",
      content: () => (
        <div className="flex flex-col">
          {bankaccts.map((item, index) =>
            renderAccountRow(
              item,
              index,
              item.subtype === "checking" ? "Checking" : "Savings"
            )
          )}
        </div>
      ),
    },
    {
      title: "Credit Cards",
      count: credit.length,
      total: credit.reduce((sum, acc) => sum + acc.current_balance, 0),
      toggleKey: "credit",
      empty: "No credit cards linked",
      content: () => (
        <div className="flex flex-col">
          {credit.map((item, index) =>
            renderAccountRow(item, index, "Credit Card")
          )}
        </div>
      ),
    },
    {
      title: "Investments",
      count: investment.length,
      total: investment.reduce((sum, acc) => sum + acc.current_balance, 0),
      toggleKey: "invest",
      empty: "No investment accounts linked",
      content: () => (
        <div className="flex flex-col">
          {investment.map((item, index) =>
            renderAccountRow(item, index, mapSubtype(item.subtype) || "")
          )}
        </div>
      ),
    },
  ];

  const netWorth = accounts
    .filter((acc) => !["Wealthfront", "Citibank"].includes(acc.institution_name))
    .reduce(
      (sum, acc) =>
        sum + (acc.type === "credit" ? -acc.current_balance : acc.current_balance),
      0
    );

  return (
    <div
      className="
        min-h-screen
        bg-[#F4F2F3]
        flex flex-col sm:flex-row
        p-2
        gap-2
        overflow-y-auto
        sm:h-screen
        sm:overflow-hidden
      "
    >
      <DashNav />

      {/* Accounts list */}
      <div
        className="w-full sm:w-1/2 h-auto
          sm:h-[calc(100vh-4rem)] mt-12 rounded-xl p-4
          bg-white/40
          backdrop-blur-md
          border border-white/40
          shadow-sm
          flex flex-col min-h-0"
      >
        <div className="flex items-baseline justify-between shrink-0">
          <h1 className="font-serif-custom text-[#3D2B2E] text-xl sm:text-2xl">
            Accounts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Net worth{" "}
            <span className="font-semibold text-[#3D2B2E]">
              {currency(netWorth)}
            </span>
          </p>
        </div>

        <div className="flex-1 min-h-0 text-[#3D2B2E] overflow-y-auto mt-3 space-y-2 pr-1">
          {accordions.map((item) => (
            <div
              className="w-full rounded-lg border border-[#3D2B2E]/10 bg-white/50 p-2"
              key={item.toggleKey}
            >
              <div
                className="flex flex-row w-full justify-between items-center gap-2 cursor-pointer select-none px-1 py-1"
                onClick={() => toggleSection(item.toggleKey)}
              >
                <div className="flex flex-row items-center min-w-0">
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ease-in-out shrink-0 text-[#3D2B2E]/70 ${
                      openSections.has(item.toggleKey)
                        ? "rotate-180"
                        : "rotate-0"
                    } mr-2`}
                  />
                  <div className="min-w-0">
                    <h1 className="font-serif-custom text-base sm:text-lg truncate leading-tight">
                      {item.title}
                    </h1>
                    <p className="text-xs text-neutral-500">
                      {item.count} {item.count === 1 ? "account" : "accounts"}
                    </p>
                  </div>
                </div>

                <h1 className="text-sm sm:text-base font-medium text-[#3D2B2E] shrink-0 tabular-nums">
                  {currency(item.total)}
                </h1>
              </div>

              <div
                className={`grid w-full transition-all duration-300 ease-in-out ${
                  openSections.has(item.toggleKey)
                    ? "grid-rows-[1fr] opacity-100 mt-2"
                    : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  {item.count === 0 ? (
                    <p className="px-1 py-2 text-sm text-neutral-400">
                      {item.empty}
                    </p>
                  ) : (
                    item.content()
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail column */}
      <div
        className="w-full sm:w-1/2 h-auto
          sm:h-[calc(100vh-4rem)]
          mt-2
          sm:mt-12
          flex flex-col min-h-0 gap-y-2"
      >
        <div
          className="w-full h-[350px]
            sm:h-1/2 rounded-xl bg-white/40 p-4
            backdrop-blur-md
            border border-white/40
            shadow-sm
            flex flex-col min-h-0"
        >
          <div className="flex items-baseline justify-between shrink-0">
            <h1 className="font-serif-custom text-[#3D2B2E] text-xl sm:text-2xl truncate">
              {selectedAccount?.official_name ?? "Select an account"}
            </h1>
            {selectedAccount && (
              <p className="text-sm font-semibold text-[#3D2B2E] tabular-nums shrink-0 ml-2">
                {currency(selectedAccount.current_balance)}
              </p>
            )}
          </div>

          <div className="flex-1 min-h-0 mt-2">
            {selectedAccount ? (
              <BalanceHistoryGraph
                accountIds={[selectedAccount?.account_id || ""]}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-neutral-400">
                Choose an account on the left to see its balance history.
              </div>
            )}
          </div>
        </div>

        <div
          className="w-full h-[350px] sm:h-1/2 rounded-xl bg-white/40 p-4
            backdrop-blur-md
            border border-white/40
            shadow-sm
            flex flex-col min-h-0"
        >
          <h1 className="font-serif-custom text-[#3D2B2E] text-xl sm:text-2xl shrink-0">
            Summary
          </h1>
          <div className="flex-1 min-h-0 mt-3 overflow-y-auto">
            <AssetsLiabilitiesBreakdown
              bankTotal={bankaccts.reduce((sum, acc) => sum + acc.current_balance, 0)}
              investmentTotal={investment.reduce((sum, acc) => sum + acc.current_balance, 0)}
              creditTotal={credit.reduce((sum, acc) => sum + acc.current_balance, 0)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}