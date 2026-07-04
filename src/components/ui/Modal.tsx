'use client';

import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: Readonly<ModalProps>) {
  const [isShaking, setIsShaking] = useState(false);
  // Status untuk mengontrol rendering komponen di DOM agar sempat beranimasi saat ditutup
  const [shouldRender, setShouldRender] = useState(isOpen);
  // Status untuk memicu kelas CSS animasi masuk/keluar
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Berikan jeda mikro agar DOM siap menerima kelas animasi masuk
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Tunggu animasi menutup selesai (200ms) sebelum menghapus komponen dari DOM
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleOverlayClick = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. Lapisan Latar Belakang (Overlay) dengan Animasi Fade */}
      <button 
        type="button"
        className={`fixed inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-sm transition-opacity duration-200
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleOverlayClick}
      >
        <span className="sr-only">Latar belakang modal</span>
      </button>
      
      {/* 2. Kotak Konten Modal dengan Animasi Zoom & Shake */}
      <div 
        className={`relative z-10 w-full max-w-md bg-white p-6 shadow-xl dark:bg-gray-800 rounded-2xl
          transition-all duration-200 ease-out
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${isShaking ? 'animate-shake' : ''}
        `}
      >
        {/* Bagian Kepala (Header) */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Bagian Isi (Body) */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          {children}
        </div>

        {/* Bagian Tombol Aksi (Footer) */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              alert('Aksi dikonfirmasi!');
              onClose();
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}
