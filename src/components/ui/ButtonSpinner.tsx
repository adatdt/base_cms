import React from 'react';

export type SpinnerType = 'spin' | 'bounce' | 'pulse';

interface ButtonSpinnerProps {
  type: SpinnerType;
}

export default function ButtonSpinner({ type }: Readonly<ButtonSpinnerProps>) {
  // 1. Jenis Spinner Tradisional (Berputar)
  if (type === 'spin') {
    return (
      <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    );
  }

  // 2. Jenis Spinner Tiga Titik Membal (Bounce)
  if (type === 'bounce') {
    return (
      <div className="flex space-x-1 items-center justify-center h-4">
        <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" />
      </div>
    );
  }

  // 3. Jenis Spinner Berdenyut (Pulse)
  return (
    <div className="flex items-center justify-center h-4 w-4">
      <div className="h-3 w-3 bg-current rounded-full animate-ping opacity-75" />
    </div>
  );
}
