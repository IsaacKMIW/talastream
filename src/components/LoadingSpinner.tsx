import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export default function LoadingSpinner({ fullScreen = true }: LoadingSpinnerProps) {
  const containerClasses = fullScreen 
    ? "flex items-center justify-center min-h-screen"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-gray-700/30"></div>
      </div>
    </div>
  );
}