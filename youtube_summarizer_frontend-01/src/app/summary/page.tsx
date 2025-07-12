"use client";

import { useState } from "react";
import VideoSummaryForm from "@/components/SummaryForm/SummaryForm";
import SummaryResult from "@/components/SummaryResult/SummaryResult";
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator";

import { useSummary } from "@/hooks/useSummary";
import ProtectedRoute from "@/components/ProtectedRoute"; // Import ProtectedRoute

interface VideoData {
  url: string;
  title: string;
  thumbnail?: string;
}

export default function Summary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const { summarizeVideo, loading: dataLoading, error } = useSummary();

  const handleSubmit = async (
    videoUrl: string,
    format: string
  ): Promise<void> => {
    setSummary(null);
    // Call to your backend API
    const response = await summarizeVideo(videoUrl, format);
    setSummary(response.summary);
    setVideoData({
      url: videoUrl,
      title: response.title || "YouTube Video",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Summarize Any YouTube Video
          </h1>

          <VideoSummaryForm onSubmit={handleSubmit} loading={dataLoading} />

          {dataLoading && <LoadingIndicator />}

          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-md border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {summary && videoData && (
            <SummaryResult summary={summary} videoData={videoData} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
