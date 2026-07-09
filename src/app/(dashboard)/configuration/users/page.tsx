"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataGrid, { ColumnProps } from "@/components/ui/DataGrid";
import Btn from "@/components/ui/Btn";
import type { TableUsers } from "./interfaces/users";
import CrudIcons from "@/components/ui/CrudIcons";
import Modal from "@/components/ui/Modal";
import { useModalStore } from "@/store/useModalStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import Add from "./components/Add";
import Edit, { UserEditData } from "./components/Edit";
import { getUserColumns } from "./utils/usersColumns";

const moduleName = `Users`;
export default function PortBranchPage() {
  const [tableData, setTableData] = useState<TableUsers[]>([]);
  // Panggil hook di sini, semua fungsi otomatis tersedia

  const triggerNotification = useNotificationStore(
    (state) => state.triggerNotification,
  );

  // Ambil seluruh state pengendali modal dari Zustand
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserEditData | null>(null);

  const handleFormSubmit = async (data: any) => {
    console.log("Kirim ke API:", data);
    closeModal();
  };

  // STATE CONTROL UNTUK SERVER-SIDE PAGINATION
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // STATE UNTUK PENCARIAN & FILTER
  const [typedQuery, setTypedQuery] = useState("");
  const [loadData, setLoadData] = useState(false);

  /**
   * Fungsi Fetch Utama dengan Parameter Terpaginasi Dinamis.
   * Dibungkus dengan useCallback demi efisiensi dependensi efek dan kelulusan SonarQube.
   */
  const fetchData = useCallback(
    async (targetPage: number, targetLimit: number, searchQuery: string) => {
      try {
        setLoadData(true);
        const requestBody = {
          page: targetPage,
          limit: targetLimit,
          search: searchQuery.trim(),
        };

        // Menggunakan metode POST dengan mengirimkan JSON body
        const response = await fetch("/configuration/users/api/get_data", {
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
          const dataTerkonversi: TableUsers[] = (result.data || []).map(
            (item: any, index: number) => ({
              ...item,
              id: item.id,
              no: (targetPage - 1) * targetLimit + index + 1,
            }),
          );

          setTableData(dataTerkonversi);
          setTotalRecords(result.total_data || 0);
        } else {
          triggerNotification(result.message, `warning`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan jaringan atau sistem.";
        triggerNotification(errorMessage, `error`);
      } finally {
        setLoadData(false);
      }
    },
    [],
  );

  // 2. Memicu Fetch data otomatis setiap kali state page atau limit berubah
  useEffect(() => {
    fetchData(page, limit, typedQuery);
  }, [page, limit, fetchData]);

  const handleRefresh = () => {
    fetchData(page, limit, typedQuery);
    setLoadData(!loadData);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRefresh();
    }
  };

  const columns: ColumnProps<TableUsers>[] = useMemo(() => {
    return getUserColumns();
  }, []);

  // Solusi SonarQube 2: Gunakan useCallback pada proses submit API
  const handleFormEditSubmit = useCallback(
    async (updatedData: UserEditData) => {
      setLoading(true);
      try {
        // Tempatkan aksi integrasi API Anda di sini (Fetch / Axios)
        console.log("Mengirim data UPDATE ke API:", updatedData);

        closeModal();
        setSelectedUser(null); // Bersihkan state referensi data lama setelah sukses
      } catch (error) {
        console.error("Gagal memperbarui pengguna:", error);
      } finally {
        setLoading(false);
      }
    },
    [closeModal],
  );
  return (
    <div className="p-6 w-full space-y-6 text-slate-800 min-h-screen bg-slate-50/50">
      {/* HEADER */}
      <Modal
        id="Form Add"
        title="Tambah Data Pengguna"
        size="5xl"
        // confirmLoading={loading}
      >
        {/* 3. Masukkan Form Fields yang otomatis menyasar formId "Form Add" */}
        <Add formId="Form Add" onSubmit={handleFormSubmit} />
      </Modal>

      {/* Modal Edit */}
      <Modal
        id="Form Edit"
        title="Ubah Data Pengguna"
        size="2xl"
        confirmLoading={loading}
      >
        <Edit
          formId="Form Edit"
          initialData={selectedUser}
          onSubmit={handleFormEditSubmit}
        />
      </Modal>

      <div className="flex flex-row items-center justify-between w-full gap-4">
        {/* Bagian Kiri: Judul dan Deskripsi Modul */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{moduleName}</h1>
          <p className="text-sm text-slate-400">
            Pusat kendali data jaringan pelabuhan, kapasitas dermaga, dan status
            operasional.
          </p>
        </div>
        {/* Bagian Kanan: Tombol Aksi */}

        <Btn
          type="button"
          variant="primary"
          size="sm"
          title="Tambah"
          onClick={() => openModal("Form Add")}
        >
          <CrudIcons name="add" size={15} />
          Tambah
        </Btn>
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
          <Btn
            type="button"
            variant="delete"
            isLoading={loadData}
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
          </Btn>
        </div>
      </div>

      {/* COMPONENT DATA GRID BERBASIS SERVER-SIDE */}
      <DataGrid
        data={tableData}
        columns={columns}
        isLoading={loadData}
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
