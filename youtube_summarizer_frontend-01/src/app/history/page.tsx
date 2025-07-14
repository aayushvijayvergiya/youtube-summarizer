"use client";
import { useEffect, useState } from "react";
import { useSummary } from "@/hooks/useSummary";

import SummaryCard from "@/components/SummaryCard/SummaryCard";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Summary {
  id: number;
  title: string;
  url: string;
  summary: string;
  createdAt: string;
}

const History = () => {
  const { fetchSummaries, summaries: summariesFromResponse } = useSummary();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchSummaries();
      } catch (error) {
        console.error("Error fetching summaries:", error);
      }
    };
    fetchData();
  }, [fetchSummaries]);

  useEffect(() => {
    if (summariesFromResponse) {
      setSummaries(summariesFromResponse as Summary[]);
    }
  }, [summariesFromResponse]);
  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-3xl font-bold mb-4">History</h1>
        <p className="text-lg text-gray-600 mb-8">
          Here are your previously summarized videos.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries?.map((summary: Summary) => (
            <SummaryCard
              key={summary.id}
              id={summary.id.toString()}
              title={summary.title}
              url={summary.url}
              createdAt={summary.createdAt || "2023-10-01T12:00:00Z"} // Placeholder date, replace with actual date if available
            />
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default History;
