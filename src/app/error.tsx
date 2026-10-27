"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md text-center">
        <span className="text-4xl" aria-hidden="true">
          🍂
        </span>
        <h1 className="h1 mt-2">A draft blew through</h1>
        <h2 className="h3 mt-1 text-danger">{error?.message ?? "Something went wrong"}</h2>
        <button type="button" className="btn btn-primary mt-4" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}