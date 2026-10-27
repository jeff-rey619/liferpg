"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, callbackUrl: "/" });
    setLoading(false);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="mb-4 text-center">
          <span className="text-4xl" aria-hidden="true">
            🔑
          </span>
          <h1 className="h2 mt-2">Hearth Key</h1>
          <p className="muted text-sm">
            Enter your email to step into the desk chamber.
          </p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="label mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@hearth.com"
              className="input w-full"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Entering…" : "Enter the Hearth"}
          </button>
        </form>
      </div>
    </div>
  );
}