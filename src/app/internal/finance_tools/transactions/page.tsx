"use client";
import React, { useEffect, useMemo, useState } from "react";
import DashNav from "@/components/DashNav";
import { SlidersHorizontal } from "lucide-react";
import Calendar from "@/components/Calendar";

type Merchant = {
  officialName: string;
  logoUrl: string | null;
  region: string | null
  city: string | null
  address: string | null
  location: number[] | null
};

type Account = {
  officialName: string;
  mask: string;
  institutionName: string;
};

type Transaction = {
  transId: string;
  amount: number;
  category: string[];
  transDate: string;
  channel: string;
  merchant: Merchant;
  account: Account;
};

type Filters = {
  startDate: string;
  endDate: string;
  categories: string[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric"
});

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function fallbackColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 88%)`;
}
function fallbackText(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 32%)`;
}

function groupByDay(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = t.transDate.slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return Array.from(groups.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export default function FinanceTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading"
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Transaction[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterView, setFilterView] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    startDate: "",
    endDate: "",
    categories: [],
  });
  const [filterResults, setFilterResults] = useState<Transaction[] | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const hasActiveFilters =
  !!filters.startDate || !!filters.endDate || filters.categories.length > 0;
  
  const toggleExpanded = (transId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(transId)) {
        next.delete(transId);
      } else {
        next.add(transId);
      }
      return next;
    });
  };

  const getMonthRange = (referenceDate: Date) => {
    const startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
    const format = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: format(startDate), endDate: format(endDate) };
  };

  useEffect(() => {
    if (!hasActiveFilters) {
      setFilterResults(null);
      return;
    }

    let cancelled = false;
    setIsFiltering(true);

    const timeout = setTimeout(async () => {
      const filterQuery = `
        query FilterTransactions($start: Date, $end: Date, $categories: [String!]) {
          transactions(start: $start, end: $end, categories: $categories) {
            transId
            amount
            category
            transDate
            channel
            merchant { officialName logoUrl region city address location }
            account { officialName mask institutionName }
          }
        }
      `;

      try {
        const res = await fetch("https://home.sriabhi.com/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            query: filterQuery,
            variables: {
              start: filters.startDate || null,
              end: filters.endDate || null,
              categories: filters.categories.length ? filters.categories : null,
            },
          }),
        });
        const data = await res.json();
        if (!cancelled) setFilterResults(data?.data?.transactions ?? []);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setFilterResults([]);
        }
      } finally {
        if (!cancelled) setIsFiltering(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [filters]);

  const fetchTransactions = async (referenceDate: Date) => {
    setStatus("loading");
    const { startDate, endDate } = getMonthRange(referenceDate);

    const gqlQuery = `
      query Transactions($start: Date!, $end: Date!) {
        transactions(start: $start, end: $end) {
          transId
          amount
          category
          transDate
          channel
          merchant { officialName logoUrl region city address location }
          account { officialName mask institutionName }
        }
      }
    `;

    try {
      const res = await fetch("https://home.sriabhi.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: gqlQuery, variables: { start: startDate, end: endDate } }),
      });
      const transData = await res.json();
      setTransactions(transData?.data?.transactions ?? []);
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchTransactions(new Date());
  }, []);

  const handleMonthChange = (dateKey: string) => {
    setSelectedDate(null);
    fetchTransactions(new Date(`${dateKey}T00:00:00`));
  };

  // Cross-month search: below 3 characters we clear results and fall back
  // to the currently-loaded month. At 3+ characters, after a short pause
  // in typing, this hits the backend directly (not scoped to the loaded
  // month) so it can find transactions from any point in your history.
  useEffect(() => {
    if (query.trim().length < 3) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timeout = setTimeout(async () => {
      const searchQuery = `
        query SearchTransactions($merchantQuery: String!) {
          transactions(merchantQuery: $merchantQuery) {
            transId
            amount
            category
            transDate
            channel
            merchant { officialName logoUrl region city address location }
            account { officialName mask institutionName }
          }
        }
      `;

      try {
        const res = await fetch("https://home.sriabhi.com/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            variables: { merchantQuery: query.trim() },
          }),
        });
        const data = await res.json();
        if (!cancelled) {
          setSearchResults(data?.data?.transactions ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const visibleTransactions = useMemo(
    () =>
      transactions
        .filter((t) => !t.category.some((c) => c.toLowerCase().includes("transfer")))
        .filter((t) => !selectedDate || t.transDate.slice(0, 10) === selectedDate),
    [transactions, selectedDate]
  );

  // While searching, results come straight from the backend (already
  // filtered there) and bypass the month/day scoping entirely.
  const activeTransactions = searchResults ?? filterResults ?? visibleTransactions;

  const activeTotal = useMemo(
    () => activeTransactions.reduce((sum, t) => sum + t.amount, 0),
    [activeTransactions]
  );

  const grouped = useMemo(() => groupByDay(activeTransactions), [activeTransactions]);

  async function updateTransactionCategory(transId: string, category: string) {
    const res = await fetch(
      "/api/finance/transaction-category",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ transId, category }),
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error("Failed to update category:", data);
      throw new Error(data?.error ?? `Request failed (${res.status})`);
    }
    return data;
  }

  const handleCategoryChange = async (transId: string, category: string) => {
    const target = transactions.find((t) => t.transId === transId);
    if (!target) return;

    const previous = transactions;

    setTransactions((current) =>
      current.map((t) =>
        t.merchant.officialName === target.merchant.officialName
          ? { ...t, category: [...t.category, category] }
          : t
      )
    );

    try {
      await updateTransactionCategory(transId, category);
    } catch (e) {
      console.error(e);
      setTransactions(previous); // roll back everyone on failure
    }
  };
  const showSkeleton = status === "loading" || (isSearching && searchResults === null);
  return (
    <div
      className="min-h-screen
                 bg-[#F4F2F3]
                 flex flex-col sm:flex-row
                 p-2 gap-2
                 overflow-y-auto
                 sm:h-screen sm:overflow-hidden"
    >
      <DashNav />

      {/* Reserved for other things */}
      <div
        className="w-full sm:w-1/2 h-1/2
          sm:h-[calc(100vh-4rem)] mt-12 sm:mt-12
          flex flex-col min-h-0 gap-y-2"
      >
        <div className="h-full sm:h-1/2 flex items-center justify-center text-sm text-neutral-400 rounded-2xl bg-white
          border border-neutral-200/70
          shadow-sm"
        >
          <Calendar
            transactions={transactions}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              if (date > new Date().toISOString().slice(0, 10)) {
                setSelectedDate(null);
                return;
              }
              setSelectedDate((prev) => (prev === date ? null : date));
            }}
            onMonthChange={handleMonthChange}
          />
        </div>
        <div className="hidden h-1/2 sm:flex items-center justify-center text-sm text-neutral-400 rounded-2xl bg-white
          border border-neutral-200/70
          shadow-sm"
        >

        </div>
      </div>

      {/* Transactions */}
      <div className="w-full sm:w-1/2 sm:h-[calc(100vh-4rem)] sm:overflow-hidden flex flex-col mt-2 sm:mt-12">
        <div className="flex items-baseline justify-between px-1 mb-2">
          <h1 className="text-2xl font-serif-custom font-semibold text-neutral-900">
            Transactions
          </h1>
          {status === "ready" && (
            <span className="text-sm text-neutral-500">
              {activeTransactions.length} {searchResults ? "results" : "this month"} ·{" "}
              <span className="font-medium text-neutral-700 tabular-nums">
                {currency.format(activeTotal)}
              </span>
            </span>
          )}
        </div>
        <div className="flex flex-col mb-2">
          <div
              className="w-full flex mb-2"
          >
              <input
                  placeholder="Search anything"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border border-gray-300 p-2 text-black rounded-lg w-full text-sm bg-[#F4F2F3]"
              />
              <button
                  className="bg-[#3D2B2E] flex flex-row px-4 py-0.25 items-center ml-2 rounded-md hover:cursor-pointer hover:bg-[#6B4C51]"
                  onClick={() => setFilterView(!filterView)}
              >
                  <SlidersHorizontal
                      color="white"
                      size={20}
                  />
                  <p className="ml-2 text-sm ">Filters</p>
              </button>
          </div>
          {filterView && (
            <div className="w-full rounded-lg border border-neutral-200 bg-white p-3 mb-2 flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md p-1.5 text-xs text-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md p-1.5 text-xs text-black"
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 mb-1.5">
                  Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CATEGORIES.map(({ name, tag }) => {
                    const isActive = filters.categories.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() =>
                          setFilters((f) => ({
                            ...f,
                            categories: isActive
                              ? f.categories.filter((c) => c !== tag)
                              : [...f.categories, tag],
                          }))
                        }
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          isActive
                            ? "bg-[#3D2B2E] text-white"
                            : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => setFilters({ startDate: "", endDate: "", categories: [] })}
                  className="self-start text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 sm:overflow-y-auto rounded-2xl bg-white border border-neutral-200/70 shadow-sm">
          {showSkeleton && <TransactionsSkeleton />}

          {!showSkeleton && status === "error" && (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-sm font-medium text-neutral-800">
                Couldn&apos;t load transactions
              </p>
              <p className="text-sm text-neutral-500">
                Check that home.sriabhi.com/graphql is reachable and try again.
              </p>
            </div>
          )}

          {!showSkeleton && status === "ready" && activeTransactions.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-sm font-medium text-neutral-800">
                {searchResults ? "No matching transactions" : "Nothing here yet"}
              </p>
              <p className="text-sm text-neutral-500">
                {searchResults
                  ? "Try a different merchant name."
                  : "No transactions have posted for this month."}
              </p>
            </div>
          )}

          {!showSkeleton && status === "ready" &&
            grouped.map(([day, dayTransactions]) => (
              <div key={day}>
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-400 border-b border-neutral-100 flex flex-row justify-between items-center">
                  <div>
                    {dayFormatter.format(new Date(`${day}T00:00:00`))}
                  </div>
                  <div className={`tabular-nums ${dayTransactions.reduce((sum, t) => sum + t.amount, 0) > 30 ? "text-red-400" : ""}`}>
                    {dayTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                  </div>
                </div>
                <ul>
                  {dayTransactions.map((t) => (
                    <TransactionRow
                      key={t.transId}
                      transaction={t}
                      isExpanded={expandedIds.has(t.transId)}
                      onToggle={() => toggleExpanded(t.transId)}
                      onCategoryChange={handleCategoryChange}
                    />
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
  isExpanded,
  onToggle,
  onCategoryChange
}: {
  transaction: Transaction;
  isExpanded: boolean;
  onToggle: () => void;
  onCategoryChange: (transId: string, category: string) => void;
}) {
  const { amount, merchant, account, category, channel } = transaction;
  const isCredit = amount < 0;
  const displayAmount = currency.format(Math.abs(amount));
  const leafCategory = category[category.length - 1] ?? "Uncategorized";

  return (
    <li className="border-b border-neutral-100 last:border-b-0">
      <div
        onClick={onToggle}
        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/80 hover:cursor-pointer transition-colors"
      >
        <div
          className="h-10 w-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold"
          style={
            merchant.logoUrl
              ? undefined
              : {
                  backgroundColor: fallbackColor(merchant.officialName),
                  color: fallbackText(merchant.officialName),
                }
          }
        >
          {merchant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={merchant.logoUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            initials(merchant.officialName)
          )}
        </div>

        <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-900">
              {merchant.officialName}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="truncate">
                {account.institutionName} · {account.officialName} ····{" "}
                {account.mask}
              </span>
              <span className="text-neutral-300">·</span>
              <span className="truncate capitalize">{channel}</span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-end shrink-0 gap-1">
            <p
              className={`shrink-0 text-sm font-bold tabular-nums ${
                isCredit ? "text-emerald-600" : "text-neutral-900"
              }`}
            >
              {isCredit ? "+" : ""}
              {displayAmount}
            </p>
            <span className="hidden sm:inline-flex shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
              {leafCategory}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <TransactionRowMenu
            isExpanded={isExpanded}
            transaction={transaction}
            onCategoryChange={onCategoryChange}
          />
        </div>
      </div>
    </li>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-neutral-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-neutral-200" />
            <div className="h-2.5 w-1/2 rounded bg-neutral-100" />
          </div>
          <div className="h-3.5 w-12 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

const PRESET_CATEGORIES = [
  { name: "🏠 Rent", tag: "Rent" },
  { name: "🧾 Bills", tag: "Bills" },
  { name: "🔁 Transfer", tag: "Transfer" },
  { name: "🛒 Groceries", tag: "Groceries" },
  { name: "🍽️ Dining", tag: "Dining" },
  { name: "✈️ Travel", tag: "Travel" },
  { name: "🛍️ Shopping", tag: "Shopping" },
  { name: "📺 Subscriptions", tag: "Subscriptions" },
  { name: "💰 Income", tag: "Income" },
  { name: "💰 Venmo", tag: "Venmo" },
  { name: "🔖 Other", tag: "Other" },
] as const;

function TransactionRowMenu({ isExpanded, transaction, onCategoryChange,}: { isExpanded: boolean, transaction: Transaction, onCategoryChange: (transId: string, category: string) => void;}) {
  const location = transaction.merchant.location;
  const hasValidLocation =
    location != null && location[0] != null && location[1] != null;
  const center: [number, number] = hasValidLocation
    ? [location[1], location[0]]
    : [-73.9464717, 40.7132148];

  const currentCategory =
    transaction.category[transaction.category.length - 1] ?? "Other";
  return (
    <div className="mx-4 mb-3 rounded-xl bg-neutral-50 border border-neutral-100 p-3 flex flex-col">
      {/* <MapboxMap
        center={center}
        zoom={12}
        navigationControl
        className="w-full h-56 rounded-lg overflow-hidden border border-neutral-200"
        onLoad={(map) => {
          if (hasValidLocation) {
            new mapboxgl.Marker({ draggable: true, color: "#1B998B" })
              .setLngLat(center)
              .addTo(map);
          }
        }}
      /> */}
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        Tag {transaction.merchant.officialName} as
      </p>
      <div className="flex flex-wrap gap-1.5 w-1/2 sm:w-1/4 mt-2">
        <div className="flex flex-wrap gap-1.5">
          {PRESET_CATEGORIES.map(({ name, tag }) => {
            const isActive = tag === currentCategory;
            return (
              <button
                key={tag}
                onClick={() => onCategoryChange(transaction.transId, tag)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#3D2B2E] text-white"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}