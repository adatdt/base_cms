"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DataGrid, { ColumnProps } from "@/components/ui/DataGrid";
import Button from "@/components/ui/Button";

interface PortRowData {
  id: string;
  no: number; // Diubah ke number untuk kalkulasi nomor baris dinamis
  pelabuhan: string;
  namaCabang: string;
  tipe: string;
  kodeCabang: string;
  status: string;
}
const moduleName = `Pelabuhan Cabang`;
export default function PortBranchPage() {
  const [portsData, setPortsData] = useState<PortRowData[]>([]);

  // STATE CONTROL UNTUK SERVER-SIDE PAGINATION
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // STATE UNTUK PENCARIAN & FILTER
  const [typedQuery, setTypedQuery] = useState("");

  /**
   * Fungsi Fetch Utama dengan Parameter Terpaginasi Dinamis.
   * Dibungkus dengan useCallback demi efisiensi dependensi efek dan kelulusan SonarQube.
   */
  const fetchPelabuhan = useCallback(
    async (targetPage: number, targetLimit: number, searchQuery: string) => {
      try {
        const requestBody = {
          page: targetPage,
          limit: targetLimit,
          search: searchQuery.trim(),
        };

        // Menggunakan metode POST dengan mengirimkan JSON body
        const response = await fetch("/port_branch/api/get_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil data (HTTP ${response.status})`);
        }

        const result = await response.json();

        if (result.success) {
          // Kalkulasi penomoran baris dinamis (NO) berdasarkan indeks halaman server
          const dataTerkonversi: PortRowData[] = (result.data || []).map(
            (item: any, index: number) => ({
              id: item.id,
              no: (targetPage - 1) * targetLimit + index + 1,
              pelabuhan: item.port_name || "-",
              namaCabang: item.branch_name || "-",
              tipe: item.ship_class_name || "-",
              kodeCabang: item.branch_code || "-",
              status: item.status || "Non-Aktif",
            }),
          );

          setPortsData(dataTerkonversi);
          setTotalRecords(result.total_data || 0);
        }
      } catch (err: any) {
        console.error("Gagal sinkronisasi data server:", err.message);
      }
    },
    [],
  );

  // 2. Memicu Fetch data otomatis setiap kali state page atau limit berubah
  useEffect(() => {
    fetchPelabuhan(page, limit, typedQuery);
  }, [page, limit, fetchPelabuhan]);

  const handleRefresh = () => {
    fetchPelabuhan(page, limit, typedQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRefresh();
    }
  };

  const columns: ColumnProps<PortRowData>[] = [
    {
      key: "no",
      header: "NO",
      className: "w-12 text-center text-slate-500",
    },
    {
      key: "pelabuhan",
      header: "PELABUHAN",
      className: "font-semibold text-slate-800",
    },
    {
      key: "namaCabang",
      header: "NAMA CABANG",
      className: "text-slate-700",
    },
    {
      key: "tipe",
      header: "TIPE",
      className: "text-slate-600 font-medium",
    },
    {
      key: "kodeCabang",
      header: "KODE CABANG",
      className: "w-28 font-mono text-slate-500 font-medium",
    },
    {
      key: "status",
      header: "STATUS",
      className: "text-center w-28",
      render: (row) => (
        <span
          className={`px-1 py-1 rounded-full text-xs font-semibold ${
            row.status == "1"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {row.status == "1" ? "Aktif" : "Non Aktif"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "AKSI",
      className: "text-center whitespace-nowrap text-xs font-semibold",
      render: (row) => (
        <>
          <Link
            href={`/cabang/edit/${row.id}`}
            className="text-blue-600 hover:text-blue-700 mr-4"
          >
            Ubah
          </Link>
          <button
            onClick={() => alert(`Trigger hapus ID: ${row.id}`)}
            className="text-slate-400 hover:text-rose-600 transition-colors"
          >
            Hapus
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="p-6 w-full space-y-6 text-slate-800 min-h-screen bg-slate-50/50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{moduleName}</h1>
          <p className="text-sm text-slate-400">
            Pusat kendali data jaringan pelabuhan, kapasitas dermaga, dan status
            operasional.
          </p>
        </div>
      </div>

      {/* CONTROL BAR */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center w-full">
        <div className="flex flex-1 items-center gap-2 max-w-md w-full">
          <div className="flex flex-1 items-center w-full space-x-0 isolate">
            <span className="flex items-center justify-center bg-slate-100 border border-slate-200 rounded-l-lg rounded-r-none h-8.5 px-3.5 text-xs font-medium text-slate-500 select-none whitespace-nowrap z-10">
              Cari data
            </span>
            <input
              type="text"
              placeholder="Ketik kode, nama, atau wilayah..."
              value={typedQuery}
              onChange={(e) => setTypedQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-50 border border-slate-200 rounded-r-lg rounded-l-none h-8.5 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:z-20 transition-all shadow-sm -ml-px"
            />
          </div>
          <Button
            type="button"
            variant="delete"
            size="sm"
            onClick={handleRefresh}
            className="flex! flex-row! items-center justify-center gap-1.5 shadow-sm min-w-17.5"
          >
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z"
              />
            </svg>
            <span className="whitespace-nowrap block">Cari</span>
          </Button>
        </div>
      </div>

      {/* COMPONENT DATA GRID BERBASIS SERVER-SIDE */}
      <DataGrid
        data={portsData}
        columns={columns}
        currentPage={page}
        rowsPerPage={limit}
        totalData={totalRecords}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1); // Otomatis reset ke halaman 1 saat baris diubah agar tidak melompat keluar batas
        }}
      />
    </div>
  );
}
