import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="mt-4 text-gray-600">Generating summary, please wait...</p>
      <p className="mt-2 text-sm text-gray-500">This may take a minute for longer videos</p>
    </div>
  );
};

export default LoadingIndicator;