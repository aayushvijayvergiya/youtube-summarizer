"use client";

import { useEffect } from "react";
import { useAuthContext, AuthStatus } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LoadingIndicator from "./LoadingIndicator/LoadingIndicator"; // Adjust the import path as needed

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state: { status } } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // If the auth status is UNAUTHENTICATED, redirect to the auth page
    if (status === AuthStatus.UNAUTHENTICATED) {
      router.push("/auth");
    }
  }, [status, router]); // Rerun effect when status or router changes

  // While authenticating or status is unknown, show a loading indicator
  if (status === AuthStatus.AUTHENTICATING || status === AuthStatus.UNKNOWN) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator /> {/* Use your LoadingIndicator component */}
      </div>
    );
  }

  // If authenticated, render the children
  if (status === AuthStatus.AUTHENTICATED) {
    return <>{children}</>;
  }

  // If unauthenticated, we are redirecting, so render nothing or a simple message
  return null;
};

export default ProtectedRoute;
