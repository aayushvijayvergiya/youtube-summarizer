"use client";

import { useEffect } from "react";
import { useAuth } from "../hooks/auth";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, redirectToAuth } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated);
    if (!isAuthenticated) {
      redirectToAuth();
    }
  }, [isAuthenticated, redirectToAuth]);

  return (
    <div className="bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to YouTube Summarizer</h1>
        <p className="mt-4 text-lg text-gray-600">Your one-stop solution for summarizing YouTube videos.</p>
        <p className="mt-2 text-lg text-gray-600">Please navigate to the <Link className="text-blue-500 hover:underline" href={'/summary'}>summary</Link> page to get started.</p>
      </div>
    </div>
  );
}
