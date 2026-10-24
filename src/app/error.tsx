"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded border px-3 py-2 text-sm"
      >
        Try again
      </button>
    </main>
  );
}