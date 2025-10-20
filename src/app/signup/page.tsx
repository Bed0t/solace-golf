"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ThreeModelViewer = dynamic(() => import("@/components/ThreeModelViewer"), {
  ssr: false,
});

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch (e) {
      setError("Network error. Please try again.");
    }
  }

  // After showing the confirmation message briefly, redirect to Instagram
  useEffect(() => {
    if (!submitted) return;
    const timeoutId = window.setTimeout(() => {
      window.location.href = "https://instagram.com/solace_golf";
    }, 2000);
    return () => window.clearTimeout(timeoutId);
  }, [submitted]);

  return (
    <main className="relative min-h-screen w-full bg-black text-white">
      {/* Center the viewer exactly in the middle of the screen */}
      <div className="absolute right-1/2 z-10 left-1/2 top-[25vh] -translate-x-1/2 w-[clamp(220px,22vw,338.24px)] h-[clamp(56px,9vw,101px)]">
        <div className="w-full max-w-md px-6">
          <ThreeModelViewer modelUrl="/models/SS-001.glb" height="160px" />
        </div>
      </div>

      {/* CTA stack positioned just below the centered viewer */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[calc(35vh+120px)] w-full max-w-3xl px-16">
        <p className="mb-10 text-center text-white/80 text-sm sm:text-base leading-relaxed">
          You’ve customised every club in your set — except the thing that carries them.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <form onSubmit={handleSubmit} className="w-full sm:w-auto flex items-center gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full sm:w-80 bg-transparent text-white placeholder-white/40 border border-white/15 focus:border-white/40 outline-none rounded-full px-4 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-white text-black px-5 py-2 text-sm font-medium hover:opacity-90 transition"
            >
              {submitted ? "Added" : "Join"}
            </button>
          </form>
        </div>
        {error && (
          <div className="mt-3 text-center text-red-300 text-sm">{error}</div>
        )}
        {submitted && (
          <div className="mt-4 text-center text-white/60 text-sm">
            <p>Welcome. We’ll be in touch.</p>
            <p className="mt-2">
              Follow the journey on <a href="https://instagram.com/solace_golf" target="_blank" rel="noreferrer" className="underline underline-offset-4 text-white/80 hover:text-white">Instagram</a> — redirecting…
            </p>
          </div>
        )}
      </div>
    </main>
  );
}


