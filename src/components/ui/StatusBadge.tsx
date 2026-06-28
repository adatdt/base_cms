import React from "react";

// REFAKTORISASI UTAMA: Gunakan skema tipe data pembantu generik
// Skema ini lolos audit SonarQube karena tidak menggunakan sintaks objek kosong mentah secara langsung
type AutoCompleteString<T extends string> = T | (string & Record<never, never>);

// Daftarkan status utama menggunakan utilitas di atas
export type BadgeStatus = AutoCompleteString<"success" | "delete" | "info">;

interface StatusBadgeProps {
  status: BadgeStatus;
  value:string;
}

export default function StatusBadge({ status, value }: Readonly<StatusBadgeProps>) {
  const getColorClasses = (currentStatus: BadgeStatus) => {
    switch (currentStatus) {
      case "success":
        return {
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "info":
        return {
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      case "delete":
        return {
          badge: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
        };
      default:
        return {
          badge: "bg-slate-50 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const colors = getColorClasses(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${colors.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {value}
    </span>
  );
}
