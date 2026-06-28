import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        {/* Header Bersama untuk Halaman Auth */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            SITOLAUT
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Balai Pengelola Transportasi Laut
          </p>
        </div>
        
        {/* Halaman /login atau /register akan dimuat di sini */}
        {children}
      </div>
    </main>
  );
}
