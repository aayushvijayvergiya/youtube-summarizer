'use client';
import { useState } from 'react';
import Image from 'next/image';

interface VideoData {
  thumbnail?: string;
  title: string;
  url: string;
}

interface SummaryResultProps {
  summary: string;
  videoData: VideoData;
}

const SummaryResult: React.FC<SummaryResultProps> = ({ summary, videoData }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary Result</h2>
          
          {/* Video info */}
          <div className="flex flex-col sm:flex-row mb-6 items-center">
            {videoData.thumbnail && 
                <Image 
                  src={videoData.thumbnail} 
                  alt="Video thumbnail" 
                  width={192} 
                  height={108} 
                  className="w-full sm:w-48 rounded-md"
                />
            }
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">{videoData.title}</h3>
              <a 
                href={videoData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-sm"
              >
                View original video
              </a>
            </div>
          </div>
          
          {/* Summary content */}
          <div className="prose max-w-none mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-2">Summary:</h4>
            <div className="bg-gray-50 p-4 rounded-md text-gray-800">
              {summary.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryResult;