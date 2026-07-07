"use client";

import React, { useEffect } from "react";

export type NotificationType =
  | "error"
  | "warning"
  | "success"
  | "info"
  | "default";

interface NotificationProps {
  message: string | null;
  type?: NotificationType;
  position?: string;
  duration?: number;
  onClose: () => void;
}

export default function Notification({
  message,
  type = "default",
  position = "top-4 right-4",
  duration = 3000,
  onClose,
}: Readonly<NotificationProps>) {
  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Perpaduan warna pastel cerah premium dengan aksen border yang hidup
  const typeStyles: Record<NotificationType, string> = {
    error:
      "bg-red-50/95 border-red-500 text-red-800 shadow-red-100 dark:bg-red-950/95 dark:border-red-500 dark:text-red-200 dark:shadow-none",
    warning:
      "bg-amber-50/95 border-amber-500 text-amber-900 shadow-amber-100 dark:bg-amber-950/95 dark:border-amber-500 dark:text-amber-200 dark:shadow-none",
    success:
      "bg-emerald-50/95 border-emerald-500 text-emerald-900 shadow-emerald-100 dark:bg-emerald-950/95 dark:border-emerald-500 dark:text-emerald-200 dark:shadow-none",
    info: "bg-sky-50/95 border-sky-500 text-sky-900 shadow-sky-100 dark:bg-sky-950/95 dark:border-sky-500 dark:text-sky-200 dark:shadow-none",
    default:
      "bg-slate-50/95 border-slate-400 text-slate-800 shadow-slate-100 dark:bg-slate-900/95 dark:border-slate-600 dark:text-slate-200 dark:shadow-none",
  };

  // Ikon SVG Khusus yang disesuaikan warnanya agar cerah dan serasi dengan tema
  const icons: Record<NotificationType, React.ReactNode> = {
    error: (
      <svg
        className="w-5 h-5 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="w-5 h-5 text-amber-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    success: (
      <svg
        className="w-5 h-5 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    info: (
      <svg
        className="w-5 h-5 text-sky-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    default: (
      <svg
        className="w-5 h-5 text-slate-500 dark:text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed ${position} z-50 flex items-center w-full max-w-sm p-4 border-l-4 rounded-r-xl shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${typeStyles[type]}`}
      role="alert"
    >
      {/* Container Ikon */}
      <div className="inline-flex items-center justify-center shrink-0">
        {icons[type]}
      </div>

      {/* Konten Teks */}
      <div className="ml-3 text-sm font-semibold tracking-wide wrap-break-word flex-1">
        {message}
      </div>

      {/* Tombol Tutup (Sleek Close Button) */}
      <button
        type="button"
        onClick={onClose}
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg text-current opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 inline-flex items-center justify-center h-8 w-8 transition-all"
        aria-label="Close"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
