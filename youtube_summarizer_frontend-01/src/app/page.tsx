"use client";

import Dashboard from "@/components/Dashboard/Dashboard";
import { useAuthContext, AuthStatus } from "@/context/AuthContext"; // Import AuthStatus
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator"; // Import LoadingIndicator

export default function Home() {
  const { state: { status, user } } = useAuthContext(); // Use the status from auth context

  // Show loading indicator while authentication status is unknown or authenticating
  if (status === AuthStatus.UNKNOWN || status === AuthStatus.AUTHENTICATING) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator />
      </div>
    );
  }

  // If authenticated, show the Dashboard
  if (status === AuthStatus.AUTHENTICATED && user) {
    return <Dashboard user={user} />;
  }

  // If unauthenticated, show a welcome message with login option
  if (status === AuthStatus.UNAUTHENTICATED) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Welcome! Please log in to continue.</p>
        {/* You might want to add a link to the login page here */}
      </div>
    );
  }

  // Handle any other unexpected states (optional)
  return null;
}
