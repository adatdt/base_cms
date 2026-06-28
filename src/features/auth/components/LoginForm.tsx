"use client";

import { useActionState } from "react";
import { loginUser, ActionState } from "../actions/loginUser";

const initialState: ActionState = {
  success: false,
  message: "",
};

export default function LoginForm() {
  // useActionState adalah standard terbaru di React 19 / Next.js 16 untuk form
  const [state, formAction, isPending] = useActionState(loginUser, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {/* Alert Error / Sukses Global */}
      {state.message && (
        <div className={`p-3 text-sm rounded-lg border ${
          state.success 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-rose-50 text-rose-700 border-rose-200"
        }`}>
          {state.message}
        </div>
      )}

      {/* Input Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Alamat Email
        </label>
       <input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  placeholder="contoh@sitolaut.id"
  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-600 placeholder-slate-400 ${
    state.errors?.email ? "border-rose-400 focus:ring-rose-500" : "border-slate-300"
  }`}
/>

        {state.errors?.email && (
          <p className="mt-1 text-xs text-rose-600">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Input Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Kata Sandi
        </label>
        <input
  id="password"
  name="password"
  type="password"
  autoComplete="current-password"
  placeholder="••••••••"
  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-600 placeholder-slate-400 ${
    state.errors?.password ? "border-rose-400 focus:ring-rose-500" : "border-slate-300"
  }`}
/>

        {state.errors?.password && (
          <p className="mt-1 text-xs text-rose-600">{state.errors.password[0]}</p>
        )}
      </div>

      {/* Tombol Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            {/* Spinner loading sederhana */}
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Memverifikasi...
          </span>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
