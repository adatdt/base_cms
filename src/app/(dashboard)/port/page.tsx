"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import DataGrid, { ColumnProps } from "@/components/ui/DataGrid";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button"; 

interface PortRowData {
  id: string;
  code: string;
  name: string;
  region: string;
  docksCount: number;
  tariffClass: string;
  status: "Aktif" | "Maintenance" | "Non-Aktif";
  lastUpdated: string;
}

export default function PortGridDashboardPage() {
  const [portsData, setPortsData] = useState<PortRowData[]>([
    { id: "1", code: "IDSNR", name: "Pelabuhan Sanur", region: "Denpasar, Bali", docksCount: 5, tariffClass: "Kelas A", status: "Aktif", lastUpdated: "26 Jun 2026" },
    { id: "2", code: "IDNPD", name: "Pelabuhan Nusa Penida", region: "Klungkung, Bali", docksCount: 3, tariffClass: "Kelas B", status: "Aktif", lastUpdated: "25 Jun 2026" },
    { id: "3", code: "IDPDB", name: "Pelabuhan Padangbai", region: "Karangasem, Bali", docksCount: 4, tariffClass: "Kelas A", status: "Maintenance", lastUpdated: "20 Jun 2026" },
  ]);

  // 1. DUA STATE TERPISAH UNTUK PENCARIAN (REKOMENDASI PERFORMA)
  const [typedQuery, setTypedQuery] = useState("");      // Menampung teks yang sedang diketik
  const [activeQuery, setActiveQuery] = useState("");    // Menampung teks yang SIAP disaring (setelah tombol diklik)
  const [selectedStatus, setSelectedStatus] = useState("Semua");

  // 1. Fungsi pencarian menjadi sangat sederhana dan bersih
const handleSearchSubmit = () => {
  setActiveQuery(typedQuery);
};

// Fungsi deteksi jika user menekan tombol Enter di Keyboard
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    handleSearchSubmit();
  }
};
  // LOGIKA PENYARINGAN DATA (HANYA BERJALAN JIKA activeQuery ATAU selectedStatus BERUBAH)
  const filteredPorts = useMemo(() => {
    return portsData.filter((port) => {
      const lowerQuery = activeQuery.toLowerCase();

      const matchesSearch =
        port.code.toLowerCase().includes(lowerQuery) ||
        port.name.toLowerCase().includes(lowerQuery) ||
        port.region.toLowerCase().includes(lowerQuery);

      const matchesStatus = selectedStatus === "Semua" || port.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [portsData, activeQuery, selectedStatus]);

  // KONFIGURASI KOLOM TABEL GLOBAL SECARA DINAMIS
  const columns: ColumnProps<PortRowData>[] = [
    { key: "code", header: "Kode Node", className: "w-24 font-mono text-slate-500 group-hover:text-blue-600 font-medium" },
    { key: "name", header: "Nama Pelabuhan", className: "font-semibold text-slate-800" },
    { key: "region", header: "Wilayah / Regional", className: "text-slate-600" },
    { 
      key: "docksCount", 
      header: "Jumlah Dermaga", 
      className: "text-center",
      render: (row) => <StatusBadge value={`${row.docksCount} Slot`} status="default" /> ,
    },
    { key: "tariffClass", header: "Grup Tarif", className: "text-slate-700 font-medium" },
    {
      key: "status",
      header: "Status Layanan",
      render: (row) => (
        <StatusBadge 
          value={row.status} 
          status={row.status === "Aktif" ? "success" : "default"} 
        />
      )
    },
    {
      key: "actions",
      header: "Aksi Internal",
      className: "text-right whitespace-nowrap text-xs font-semibold",
      render: (row) => (
        <>
          <Link href={`/port/list?edit=${row.id}`} className="text-blue-600 hover:text-blue-700 mr-4">
            Konfigurasi
          </Link>
          <button 
            onClick={() => alert(`Trigger hapus ID: ${row.id}`)}
            className="text-slate-400 hover:text-rose-600 transition-colors"
          >
            Hapus
          </button>
        </>
      )
    }
  ];

  return (
    <div className="p-6 w-full space-y-6 text-slate-800 min-h-screen bg-slate-50/50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Kontrol Pelabuhan</h1>
          <p className="text-sm text-slate-400">Pusat kendali data jaringan pelabuhan, kapasitas dermaga, dan status operasional.</p>
        </div>
      </div>

      {/* CONTROL BAR CONTROLLED BY PAGE */}
<div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center   w-full">
  
  {/* SISI KIRI: INPUT PENCARIAN & TOMBOL KOMPONEN MERAH */}
  <div className="flex flex-1 items-center gap-2 max-w-md w-full">
<div className="flex flex-1 items-center w-full space-x-0 isolate">
  {/* 1. Label Abu-Abu (Sudut Kanan Dipotong Siku) */}
  <span className="flex items-center justify-center bg-slate-100 border border-slate-200 rounded-l-lg rounded-r-none h-[34px] px-3.5 text-xs font-medium text-slate-500 select-none whitespace-nowrap z-10">
    Node Pelabuhan
  </span>
  
  {/* 2. Kolom Input Utama (Sudut Kiri Dipotong Siku & Digeser Menindih Celah) */}
  <input
    type="text"
    placeholder="Ketik kode, nama, atau wilayah..."
    value={typedQuery}
    onChange={(e) => setTypedQuery(e.target.value)}
    onKeyDown={handleKeyDown}
    className="w-full bg-slate-50 border border-slate-200 rounded-r-lg rounded-l-none h-[34px] px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:z-20 transition-all shadow-sm -ml-[1px]"
  />
</div>
    <Button
  type="button"
  variant="delete"
  size="sm"
  onClick={handleSearchSubmit}
  // Menambahkan tanda seru (!) pada flex-row untuk menjamin posisi mendatar ke samping
  className="flex! flex-row! items-center justify-center gap-1.5 shadow-sm min-w-17.5"
>
  {/* Ikon Kaca Pembesar SVG */}
  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
  </svg>
  
  {/* Teks Cari dipaksa tidak memotong ke bawah */}
  <span className="whitespace-nowrap block">Cari</span>
</Button>


  </div>

  {/* SISI KANAN: DROPDOWN FILTER STATUS */}
  <div className="flex items-center gap-2 justify-between md:justify-end text-xs border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
    <span className="text-slate-500 whitespace-nowrap font-medium">Filter Status:</span>
    <select
      value={selectedStatus}
      onChange={(e) => setSelectedStatus(e.target.value)}
      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-all shadow-sm"
    >
      <option value="Semua">Semua Status</option>
      <option value="Aktif">Aktif</option>
      <option value="Maintenance">Maintenance</option>
      <option value="Non-Aktif">Non-Aktif</option>
    </select>
  </div>
</div>


      {/* COMPONENT DATA GRID */}
      <DataGrid 
        data={filteredPorts} 
        columns={columns}
        totalEntriesBeforeFilter={portsData.length}
      />
    </div>
  );
}
