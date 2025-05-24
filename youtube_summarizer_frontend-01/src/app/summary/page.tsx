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
  const [summary, setSummary] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const { state: { authenticating }, isAuthenticated, redirectToAuth } = useAuthContext();
  const { summarizeVideo, loading: dataLoading, error } = useSummary();

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
    setSummary(null);
      // Call to your backend API
      const response = await summarizeVideo(videoUrl, format);
      setSummary(response.summary);
      setVideoData({
        url: videoUrl,
        title: response.title || "YouTube Video",
      });
  };

  const isAuthenticating = authenticating === "LOADING" || !isAuthenticated();
  
  // Show loading indicator if authenticating
  // or if the user is not authenticated
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Summarize Any YouTube Video
        </h1>

        <VideoSummaryForm onSubmit={handleSubmit} loading={dataLoading}/>

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
  );
}
