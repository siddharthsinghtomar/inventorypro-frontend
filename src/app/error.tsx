"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry in production
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-card border border-red-200 dark:border-red-900/50 rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-3">Something went wrong!</h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          We encountered an unexpected error while processing your request. Please try again or return to the dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center w-full sm:w-1/2 gap-2 px-4 py-2.5 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <RefreshCcw size={16} />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full sm:w-1/2 gap-2 px-4 py-2.5 rounded-lg font-medium text-sm border border-input bg-card hover:bg-muted text-foreground transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
