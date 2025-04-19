'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface VideoSummaryFormProps {
  onSubmit: (url: string, format: string) => void;
}

const VideoSummaryForm: React.FC<VideoSummaryFormProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState<string>('');
  const [format, setFormat] = useState<string>('paragraph');
  const [isValidUrl, setIsValidUrl] = useState<boolean>(true);

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\?.*)?$/;
    return youtubeRegex.test(url);
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    setIsValidUrl(inputUrl === '' || validateYouTubeUrl(inputUrl));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!url) {
      setIsValidUrl(false);
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setIsValidUrl(false);
      return;
    }

    onSubmit(url, format);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video URL
          </label>
          <input
            id="video-url"
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              !isValidUrl ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {!isValidUrl && (
            <p className="mt-1 text-sm text-red-600">
              Please enter a valid YouTube URL
            </p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
            Summary Format
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="paragraph">Paragraph</option>
            <option value="bullet">Bullet Points</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Generate Summary
        </button>
      </form>
    </div>
  );
};

export default VideoSummaryForm;