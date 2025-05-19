"use client";

import { useState, useEffect } from "react";
import VideoSummaryForm from "@/components/SummaryForm/SummaryForm";
import SummaryResult from "@/components/SummaryResult/SummaryResult";
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator";
import { useAuthContext } from "@/context/AuthContext";
import { useSummary } from "@/hooks/useSummary";

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

  const { state: { authenticating }, isAuthenticated, redirectToAuth } = useAuthContext();
  const { summarizeVideo, loading } = useSummary();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (authenticating === 'LOADED' && !isAuthenticated()) {
      redirectToAuth();
    }
  }, [authenticating, isAuthenticated, redirectToAuth]);

  const handleSubmit = async (
    videoUrl: string,
    format: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      // Call to your backend API
      const response = await summarizeVideo(videoUrl, format);
      setSummary(response.summary);
      setVideoData({
        url: videoUrl,
        title: response.title || "YouTube Video",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
    }
  }, [loading]);

  const isAuthenticating = authenticating === "LOADING";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Summarize Any YouTube Video
        </h1>

        <VideoSummaryForm onSubmit={handleSubmit} loading={loading}/>

        {isLoading && isAuthenticating && <LoadingIndicator />}

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
