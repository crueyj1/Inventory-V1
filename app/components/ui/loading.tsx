import React from "react";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 w-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-2"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
