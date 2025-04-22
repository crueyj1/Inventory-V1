import React from "react";
import { useAuth } from "../../hooks/use-auth";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { userEmail, handleSignIn, handleSignOut, loading } = useAuth();
  
  return (
    <header className="flex justify-between items-center mb-4 p-4 bg-gray-50 border-b">
      <h1 className="text-2xl font-bold">{title}</h1>
      
      <div className="text-sm">
        {loading ? (
          <span className="text-gray-400">Loading...</span>
        ) : userEmail ? (
          <div className="flex gap-2 items-center">
            <span className="text-gray-600">{userEmail}</span>
            <button 
              onClick={handleSignOut} 
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={handleSignIn} 
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
