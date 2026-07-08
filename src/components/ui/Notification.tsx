"use client";

import React, { useCallback, useEffect, useState } from "react";

export type NotificationType =
  | "error"
  | "warning"
  | "success"
  | "info"
  | "default";

interface NotificationProps {
  message: string | null;
  type?: NotificationType;
  duration?: number;
  onClose: () => void;
}

export default function Notification({
  message,
  type = "default",
  duration = 3000,
  onClose,
}: Readonly<NotificationProps>) {
  const [isHovered, setIsHovered] = useState(false);
  // 1. State baru untuk memicu kelas animasi keluar
  const [isDisappearing, setIsDisappearing] = useState(false);

  // 2. Fungsi penutup kustom untuk menjalankan animasi keluar dulu selama 250ms
  const handleStartDismiss = useCallback(() => {
    setIsDisappearing(true);
    setTimeout(() => {
      onClose();
    }, 250); // Waktu jeda harus sama dengan durasi --animate-toast-out (0.25s)
  }, [onClose]);

  useEffect(() => {
    if (duration <= 0 || !message || isHovered || isDisappearing) return;

    const timer = setTimeout(() => {
      handleStartDismiss(); // Panggil fungsi animasi keluar saat waktu habis
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, message, isHovered, isDisappearing, handleStartDismiss]);

  if (!message) return null;

  // Warna pastel premium berbasis OKLCH konstan (dikunci agar tidak terpengaruh tema dark mode)
  const typeStyles: Record<NotificationType, string> = {
    error:
      "bg-[oklch(96.5%_0.025_24.37)] border-[oklch(62.7%_0.194_24.37)] text-[oklch(35%_0.13_24.37)] shadow-[0_8px_30px_rgb(0_0_0_/_0.03),_0_1px_4px_rgb(0_0_0_/_0.02)]",
    warning:
      "bg-[oklch(97.3%_0.02_74.34)] border-[oklch(76.2%_0.158_74.34)] text-[oklch(40%_0.11_74.34)] shadow-[0_8px_30px_rgb(0_0_0_/_0.03),_0_1px_4px_rgb(0_0_0_/_0.02)]",
    success:
      "bg-[oklch(96%_0.04_162.48)] border-[oklch(69.6%_0.17_162.48)] text-[oklch(35%_0.12_162.48)] shadow-[0_8px_30px_rgb(0_0_0_/_0.03),_0_1px_4px_rgb(0_0_0_/_0.02)]",
    info: "bg-[oklch(96.6%_0.022_245.92)] border-[oklch(62.8%_0.177_245.92)] text-[oklch(35%_0.12_245.92)] shadow-[0_8px_30px_rgb(0_0_0_/_0.03),_0_1px_4px_rgb(0_0_0_/_0.02)]",
    default:
      "bg-[oklch(96.5%_0.008_255.43)] border-[oklch(61.3%_0.021_255.43)] text-[oklch(35%_0.015_255.43)] shadow-[0_8px_30px_rgb(0_0_0_/_0.03),_0_1px_4px_rgb(0_0_0_/_0.02)]",
  };

  const icons: Record<NotificationType, React.ReactNode> = {
    error: (
      <svg
        className="w-5 h-5 shrink-0 text-[oklch(62.7%_0.194_24.37)]"
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
        className="w-5 h-5 shrink-0 text-[oklch(76.2%_0.158_74.34)]"
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
        className="w-5 h-5 shrink-0 text-emerald-500"
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
        className="w-5 h-5 shrink-0 text-[oklch(62.8%_0.177_245.92)]"
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
        className="w-5 h-5 shrink-0 text-[oklch(61.3%_0.021_255.43)]"
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${
        isDisappearing ? "animate-toast-out" : "animate-toast-in"
      } flex items-center w-full max-w-sm p-4 border-l-4 rounded-r-xl shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${typeStyles[type]}`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center shrink-0">
        {icons[type]}
      </div>
      <div className="ml-3 text-sm font-semibold tracking-wide wrap-break-word flex-1">
        {message}
      </div>
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
