"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

const BARS = 24;
export function AudioWaves() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [levels, setLevels] = useState<number[]>(Array(BARS).fill(0.2));
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const stop = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioRef.current?.close();
    audioRef.current = null;
    setRecording(false);
    setLevels(Array(BARS).fill(0.2));
  };
  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void audioRef.current?.close();
  }, []);
  const start = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audio = new AudioContext();
      const analyser = audio.createAnalyser();
      analyser.fftSize = 128;
      audio.createMediaStreamSource(stream).connect(analyser);
      streamRef.current = stream;
      audioRef.current = audio;
      setRecording(true);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let last = 0;
      const update = (time: number) => {
        if (time - last > 55) {
          analyser.getByteFrequencyData(data);
          setLevels(Array.from({ length: BARS }, (_, i) => Math.max(0.12, Math.min(1, data[i + 2] / 180))));
          last = time;
        }
        frameRef.current = requestAnimationFrame(update);
      };
      frameRef.current = requestAnimationFrame(update);
    } catch {
      setError("Microphone unavailable. Check browser permission and try again.");
      stop();
    }
  };
  return <div className="w-full rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Voice input</h3><p className="mt-1 text-xs text-(--muted-foreground)">{recording ? "Listening to your microphone" : "Waveform preview · microphone off"}</p></div><span className={`size-2 rounded-full ${recording ? "bg-red-500" : "bg-(--muted-foreground)"}`} aria-hidden="true" /></div>
    <div className="mt-5 flex h-20 items-center justify-center gap-1 rounded-xl bg-(--stage) px-3" role="img" aria-label={recording ? "Live microphone levels" : "Decorative audio waveform preview"}>{levels.map((level, i) => <span key={i} className={`w-1 rounded-full bg-(--primary) ${recording ? "" : "audio-waves-demo"}`} style={{ height: `${Math.max(9, Math.round(level * 72))}px`, animationDelay: `${i * 55}ms` }} />)}</div>
    <button type="button" onClick={recording ? stop : () => void start()} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-(--primary) px-4 text-xs font-medium text-(--primary-foreground) focus-visible:outline-2 focus-visible:outline-offset-2">{recording ? <Square size={14} aria-hidden="true" /> : <Mic size={14} aria-hidden="true" />}{recording ? "Stop microphone" : "Test microphone"}</button>
    <p className="mt-3 text-xs text-(--muted-foreground)">Audio stays in your browser and is not uploaded.</p>
    <p role="status" className="mt-1 text-xs text-red-600">{error}</p>
    <style>{`@media (prefers-reduced-motion: no-preference) { @keyframes audio-waves-demo { 0%, 100% { transform: scaleY(.45) } 50% { transform: scaleY(1.5) } } .audio-waves-demo { animation: audio-waves-demo 1.2s ease-in-out infinite; } }`}</style>
  </div>;
}
