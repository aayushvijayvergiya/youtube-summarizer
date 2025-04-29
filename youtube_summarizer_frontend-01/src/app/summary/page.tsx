"use client";
import { useState, useEffect } from "react";
import VideoSummaryForm from "@/components/SummaryForm/SummaryForm";
import SummaryResult from "@/components/SummaryResult/SummaryResult";
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator";
import { API_BASE_URL } from "@/constants/api-constants";
import { useAuth } from "../../hooks/auth";

interface VideoData {
  url: string;
  title: string;
  thumbnail?: string;
}

export default function Summary() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const { isAuthenticated, redirectToAuth } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated);
    if (!isAuthenticated) {
      redirectToAuth();
    }
  }, [isAuthenticated, redirectToAuth]);

  const handleSubmit = async (
    videoUrl: string,
    format: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      // Call to your backend API
      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl,
          format_type: format || "paragraph",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to summarize video");
      }

      setSummary(data.summary);
      setVideoData({
        url: videoUrl,
        title: data.title || "YouTube Video",
        thumbnail: data.thumbnail || null,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Summarize Any YouTube Video
        </h1>

        <VideoSummaryForm onSubmit={handleSubmit} />

        {isLoading && <LoadingIndicator />}

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
  );
}
