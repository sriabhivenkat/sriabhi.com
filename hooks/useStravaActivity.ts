"use client";
import { useEffect, useState } from "react";
import { fetchStravaAccessToken } from "../functions/abhiPcCalls";

export function useStravaActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const accessToken = await fetchStravaAccessToken();

        let all: any[] = [];
        const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
        );

        if (!res.ok) throw new Error(`Strava error: ${res.status}`);
        const data = await res.json();

        all = [...all, ...data];

        setActivities(all);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return {
    loading,
    error,
    activities,
    runs: activities.filter((a) => a.type === "Run"),
  };
}
