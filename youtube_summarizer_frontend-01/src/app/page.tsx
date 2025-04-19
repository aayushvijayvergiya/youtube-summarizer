'use client'
import { useState } from 'react';
import Head from 'next/head';
import VideoSummaryForm from '@/components/SummaryForm/SummaryForm';
import SummaryResult from '@/components/SummaryResult/SummaryResult';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';

interface VideoData {
  url: string;
  title: string;
  thumbnail?: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const handleSubmit = async (videoUrl: string, format: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      // Call to your backend API
      const response = await fetch('http://localhost:8010/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: videoUrl,
          format_type: format || 'paragraph'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to summarize video');
      }

      // Store in local storage for history
      //  saveToHistory(data);
      
      setSummary(data.summary);
      setVideoData({
        url: videoUrl,
        title: data.title || 'YouTube Video',
        thumbnail: data.thumbnail || null
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const saveToHistory = (data: any): void => {
  //   try {
  //     const history = JSON.parse(localStorage.getItem('summarizer_history') || '[]');
  //     const newEntry = {
  //       id: Date.now(),
  //       url: data.video_url,
  //       title: data.title || 'YouTube Video',
  //       summary: data.summary,
  //       date: new Date().toISOString(),
  //     };
      
  //     // Add to beginning of array
  //     history.unshift(newEntry);
      
  //     // Keep only the most recent 20 entries
  //     const trimmedHistory = history.slice(0, 20);
      
  //     localStorage.setItem('summarizer_history', JSON.stringify(trimmedHistory));
  //   } catch (e) {
  //     console.error('Failed to save to history:', e);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>YouTube Summarizer</title>
        <meta name="description" content="Summarize YouTube videos easily" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
        
        {summary && videoData && <SummaryResult summary={summary} videoData={videoData} />}
      </main>

      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} YouTube Summarizer</p>
        </div>
      </footer>
    </div>
  );
}