import { useState } from "react";

const apiBase = "http://localhost:8000";

const statusColor = {
  Green: "bg-emerald-100 text-moss",
  Yellow: "bg-amber-100 text-gold",
  Red: "bg-rose-100 text-rose",
  Error: "bg-rose-100 text-rose",
  neutral: "bg-amber-50 text-stone-600"
};

export default function App() {
  const [status, setStatus] = useState(null);
  const [reason, setReason] = useState("Run a check-in to see triage output.");
  const [isDemoMode, setIsDemoMode] = useState(true);

  const startCheckin = async () => {
    setStatus("Starting");
    setReason("Creating a new check-in...");

    try {
      const response = await fetch(`${apiBase}/checkins/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo_mode: isDemoMode })
      });

      if (!response.ok) {
        throw new Error("Failed to start check-in");
      }

      const data = await response.json();
      const completeResponse = await fetch(`${apiBase}/checkins/${data.checkin_id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            dizziness: false,
            chest_pain: false,
            trouble_breathing: false
          },
          transcript: "Feeling ok today."
        })
      });

      if (!completeResponse.ok) {
        throw new Error("Failed to complete check-in");
      }

      const result = await completeResponse.json();
      setStatus(result.triage_status);
      setReason(result.triage_reasons.join("; "));
    } catch (error) {
      setStatus("Error");
      setReason(error?.message || "Something went wrong.");
    }
  };

  const chipClass = statusColor[status] || statusColor.neutral;
  const chipText = status || "—";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f6efe5_0%,_#f4f0e8_40%,_#f8f2ed_100%)] text-ink">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-16 pt-12 sm:px-8">
        <header className="rounded-[28px] border border-amber-100 bg-amber-50/80 p-8 shadow-hero backdrop-blur">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-700">Guardian Check-In</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Daily health check-in</h1>
          <p className="mt-3 max-w-2xl text-lg text-stone-600">
            Quick camera + voice Q&amp;A, then a simple Green/Yellow/Red result.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              className="rounded-full bg-clay px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-200/60 transition hover:-translate-y-0.5"
              onClick={startCheckin}
            >
              Start Check-In
            </button>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-clay"
                checked={isDemoMode}
                onChange={(event) => setIsDemoMode(event.target.checked)}
              />
              Demo mode
            </label>
          </div>
        </header>

        <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold">Status</h2>
          <p className="mt-2 text-stone-600">{status ? `Status: ${status}` : "Not started"}</p>
          <div className={`mt-3 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${chipClass}`}>
            {chipText}
          </div>
          <p className="mt-3 text-sm text-stone-600">{reason}</p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-amber-100 bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold">Camera</h3>
            <p className="mt-2 text-sm text-stone-600">Capture placeholder for MVP.</p>
            <button className="mt-4 rounded-xl border border-amber-200 px-4 py-2 text-sm text-stone-700">
              Simulate capture
            </button>
          </article>
          <article className="rounded-2xl border border-amber-100 bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold">Voice Q&amp;A</h3>
            <p className="mt-2 text-sm text-stone-600">ElevenLabs TTS + transcript placeholder.</p>
            <button className="mt-4 rounded-xl border border-amber-200 px-4 py-2 text-sm text-stone-700">
              Simulate Q&amp;A
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}
