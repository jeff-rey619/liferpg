import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md text-center">
        <span className="text-4xl" aria-hidden="true">
          🧭
        </span>
        <h1 className="h1 mt-2">Wandered off the desk</h1>
        <p className="muted mt-2">
          This page wandered off the desk. Head back to the hearth.
        </p>
        <Link href="/" className="btn btn-primary mt-4 no-underline">
          Return to Desk
        </Link>
      </div>
    </div>
  );
}