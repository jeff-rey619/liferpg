"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <form
        className="mt-4 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          signIn("credentials", { email, callbackUrl: "/" });
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded border px-3 py-2"
          required
        />
        <button type="submit" className="rounded border px-3 py-2">
          Sign in
        </button>
      </form>
    </main>
  );
}