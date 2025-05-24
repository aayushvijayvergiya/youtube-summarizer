"use client";

import Dashboard from "@/components/Dashboard/Dashboard";

import { useAuthContext } from "@/context/AuthContext";
import { useEffect } from "react";

export default function Home() {
  const {
    state: { user, authenticating },
    isAuthenticated,
    redirectToAuth,
  } = useAuthContext();

  // Redirect to auth if not authenticated
    useEffect(() => {
      if (authenticating === 'LOADED' && !isAuthenticated()) {
        redirectToAuth();
      }
    }, [authenticating, isAuthenticated, redirectToAuth]);

  if (!isAuthenticated() || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }
  
  return <Dashboard user={user} />;
}
