"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Circle, Check } from "lucide-react";
import { groups } from "@/app/data/mock";

export default function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id ?? "");
  const [captured, setCaptured] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setError("Kamera-Zugriff verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    // Simulated upload
    setCaptured(true);
    setTimeout(() => setCaptured(false), 2000);
  }

  if (error) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <Camera size={48} className="text-muted" />
        <p className="text-muted">{error}</p>
        <button
          onClick={startCamera}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-var(--nav-height))] flex-col bg-black">
      {/* Camera Feed */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Toast */}
      {captured && (
        <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm text-white shadow-lg">
          <Check size={16} />
          Foto hochgeladen!
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 bg-black/80 px-4 py-4">
        {/* Group Selector */}
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {/* Capture Button */}
        <button
          onClick={handleCapture}
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white transition-transform active:scale-95"
        >
          <Circle size={48} className="fill-white text-white" />
        </button>
      </div>
    </div>
  );
}
