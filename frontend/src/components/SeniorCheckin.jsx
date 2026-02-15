import { useEffect, useRef, useState } from "react";

import useCheckin from "../hooks/useCheckin.js";
import { statusColor } from "../lib/screening.js";

export default function SeniorCheckin({ authUser, authToken, logout }) {
  const {
    status,
    reason,
    isDemoMode,
    setIsDemoMode,
    voiceStatus,
    voiceLog,
    isVoiceLive,
    cameraStatus,
    facialSymmetryStatus,
    facialSymmetryReason,
    cameraVideoRef,
    startCheckin,
    startVoice,
    stopVoice,
  } = useCheckin(authUser, authToken);

  const chipClass = statusColor[status] || statusColor.neutral;
  const chipText = status || "—";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f6efe5_0%,_#f4f0e8_40%,_#f8f2ed_100%)] text-ink">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-16 pt-12 sm:px-8">
        <div className="flex items-center justify-between rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-stone-700">
          <span>
            Logged in as{" "}
            <span className="font-semibold">
              {authUser?.firstName} {authUser?.lastName}
            </span>
          </span>
          <button
            onClick={logout}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Log out
          </button>
        </div>

        <header className="rounded-[28px] border border-amber-100 bg-amber-50/80 p-8 shadow-hero backdrop-blur">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-700">
            Guardian Check-In
          </p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Daily health check-in
          </h1>
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
          <p className="mt-2 text-stone-600">
            {status ? `Status: ${status}` : "Not started"}
          </p>
          <div
            className={`mt-3 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${chipClass}`}
          >
            {chipText}
          </div>
          <p className="mt-3 text-sm text-stone-600">{reason}</p>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full lg:w-1/2">
              <h3 className="text-lg font-semibold">
                Camera + Voice Check-In
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                {isVoiceLive
                  ? `Voice status: ${voiceStatus}`
                  : "Start the live voice assistant to begin."}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Camera status: {cameraStatus}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Facial symmetry: {facialSymmetryStatus}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                {facialSymmetryReason}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-xl border border-amber-200 px-4 py-2 text-sm text-stone-700"
                  onClick={startVoice}
                  disabled={isVoiceLive}
                >
                  Start session
                </button>
                <button
                  className="rounded-xl border border-amber-200 px-4 py-2 text-sm text-stone-700"
                  onClick={stopVoice}
                  disabled={!isVoiceLive}
                >
                  Stop
                </button>
              </div>
              <div className="mt-4 max-h-40 overflow-auto rounded-lg bg-amber-50/60 p-3 text-xs text-stone-700">
                {voiceLog.length === 0
                  ? "No messages yet."
                  : voiceLog.join("\n\n")}
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="aspect-video overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/50">
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 text-xs text-stone-500">
                The camera preview appears while the 10s recording is in
                progress.
              </p>
            </div>
            <p className="mt-2 text-xs font-medium text-[#fff6e8]">
              {timerDone
                ? "Finishing analysis..."
                : isFaceScanActive
                  ? "Analyzing face data for 10 seconds..."
                  : "Loading Questions ..."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActionRow({
  onStart,
  onSecondary,
  startDisabled,
  secondaryDisabled,
  startLabel,
  secondaryLabel,
}) {
  return (
    <div className="flex w-full max-w-md flex-wrap justify-center gap-3">
      <button
        type="button"
        onClick={onStart}
        disabled={startDisabled}
        className="rounded-full bg-gradient-to-b from-[#e46535] to-[#d8542a] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_18px_rgba(222,91,47,0.28)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {startLabel}
      </button>
      <button
        type="button"
        onClick={onSecondary}
        disabled={secondaryDisabled}
        className="rounded-full border border-[#cfc4b6] bg-white px-6 py-3 text-base font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {secondaryLabel}
      </button>
    </div>
  );
}

export default function SeniorCheckin({ authUser, authToken, logout }) {
  const {
    isVoiceLive,
    isCheckinComplete,
    cameraStatus,
    cameraVideoRef,
    startVoice,
    stopVoice,
  } = useCheckin(authUser, authToken);
  const [phase, setPhase] = useState("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const [isStartLocked, setIsStartLocked] = useState(false);
  const [isPermissionChecking, setIsPermissionChecking] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  const runStartAtRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const startLockRef = useRef(false);

  const clearRunTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRunTimers();
    };
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    if (cameraStatus !== "Recording 10s..." || runStartAtRef.current) return;

    runStartAtRef.current = Date.now();
    clearRunTimers();
    intervalRef.current = window.setInterval(() => {
      if (!runStartAtRef.current) return;
      const elapsed = Math.min(
        Date.now() - runStartAtRef.current,
        FACE_CAPTURE_MS,
      );
      setElapsedMs(elapsed);
    }, 100);
    timeoutRef.current = window.setTimeout(() => {
      setElapsedMs(FACE_CAPTURE_MS);
      setTimerDone(true);
      clearRunTimers();
    }, FACE_CAPTURE_MS);
  }, [cameraStatus, phase]);

  useEffect(() => {
    if (phase !== "running") return;
    if (cameraStatus !== "Error") return;
    setElapsedMs(FACE_CAPTURE_MS);
    setTimerDone(true);
  }, [cameraStatus, phase]);

  useEffect(() => {
    if (!isCheckinComplete || isVoiceLive) return;
    clearRunTimers();
    runStartAtRef.current = null;
    setElapsedMs(FACE_CAPTURE_MS);
    setTimerDone(true);
    setPhase("complete");
    setIsStartLocked(false);
    setIsPermissionChecking(false);
    setPermissionError("");
    startLockRef.current = false;
  }, [isCheckinComplete, isVoiceLive]);

  useEffect(() => {
    if (timerDone && CAMERA_DONE_STATUSES.has(cameraStatus)) {
      setPhase("mascot");
      setIsStartLocked(false);
      startLockRef.current = false;
      clearRunTimers();
    }
  }, [cameraStatus, timerDone]);

  const handleStart = async () => {
    if (startLockRef.current || isStartLocked || phase === "running") return;
    setPermissionError("");
    setIsPermissionChecking(true);

    let preflightStream;
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Media devices API is not available in this browser.");
      }
      preflightStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (error) {
      setPermissionError("Camera and microphone access is required to start.");
      setIsPermissionChecking(false);
      return;
    } finally {
      if (preflightStream) {
        preflightStream.getTracks().forEach((track) => track.stop());
      }
    }

    setIsPermissionChecking(false);
    startLockRef.current = true;
    setIsStartLocked(true);
    setPhase("running");
    setElapsedMs(0);
    setTimerDone(false);
    runStartAtRef.current = null;
    clearRunTimers();
    void startVoice();
  };

  const handleSecondary = async () => {
    if (isVoiceLive) {
      await stopVoice();
    }
    clearRunTimers();
    runStartAtRef.current = null;
    setElapsedMs(0);
    setTimerDone(false);
    setPhase("idle");
    setIsStartLocked(false);
    setIsPermissionChecking(false);
    setPermissionError("");
    startLockRef.current = false;
  };

  const progressPercent = Math.round(
    (Math.min(elapsedMs, FACE_CAPTURE_MS) / FACE_CAPTURE_MS) * 100,
  );
  const isRunning = phase === "running";
  const showMascot = phase === "mascot";
  const isComplete = phase === "complete";
  const isFaceScanActive = isRunning && cameraStatus === "Recording 10s...";

  if (isComplete) {
    return <CompletionScreen />;
  }

  return (
    <div className={PAGE_SHELL_CLASS}>
      <main className="mx-auto flex min-h-[calc(100svh-1rem)] w-full max-w-5xl flex-col sm:min-h-[calc(100svh-1.5rem)]">
        <HeaderBar authUser={authUser} logout={logout} />

        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-5 py-6 sm:gap-6">
          <HeroStage
            showMascot={showMascot}
            cameraVideoRef={cameraVideoRef}
            isRunning={isRunning}
            progressPercent={progressPercent}
            timerDone={timerDone}
            isFaceScanActive={isFaceScanActive}
          />

          <ActionRow
            onStart={handleStart}
            onSecondary={handleSecondary}
            startDisabled={isVoiceLive || isStartLocked || isPermissionChecking}
            secondaryDisabled={!isVoiceLive && !showMascot && !isRunning}
            startLabel={
              isPermissionChecking
                ? "Checking Access..."
                : showMascot
                  ? "Start Again"
                  : isRunning
                    ? "Running..."
                    : "Start Check-In"
            }
            secondaryLabel={
              isVoiceLive || isRunning ? "Stop Session" : "Show Camera"
            }
          />

          {permissionError ? (
            <p className="text-center text-sm font-medium text-rose-700">
              {permissionError}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
