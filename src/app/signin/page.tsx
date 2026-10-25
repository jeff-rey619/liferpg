"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="h1">Sign in</h1>
        <p className="muted mt-1">Create an account with just your email. No password needed (dev mode).</p>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            await signIn("credentials", { email, callbackUrl: "/" });
            setLoading(false);
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              required
            />
          </label>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}