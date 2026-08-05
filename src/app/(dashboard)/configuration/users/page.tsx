"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataGrid, { ColumnProps } from "@/components/ui/DataGrid";
import Btn from "@/components/ui/Btn";
import type { TableUsers } from "./interfaces/users.interfaces";
import CrudIcons from "@/components/ui/CrudIcons";
import Modal from "@/components/ui/Modal";
import { useModalStore } from "@/store/useModalStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useTableStore } from "@/store/useTableStore";
import Add from "./components/Add";
import { useFormStore } from "@/store/useFormStore";
import { useShallow } from "zustand/shallow";

const moduleName = `Users`;

export default function PortBranchPage() {
    const [tableData, setTableData] = useState<TableUsers[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );

    // Ambil seluruh state pengendali modal dari Zustand
    const openModal = useModalStore((state) => state.openModal);
    const { isFetchLoading } = useFormStore(
        useShallow((state) => ({
            isFetchLoading: state.isFetchLoading,
        })),
    );

    const fetchBulkMasterOptions = useFormStore(
        (state) => state.fetchBulkMasterOptions,
    );

    // AMBIL KONTROL PAGINATION & SEARCH DARI STORE ZUSTAND SLICE 'users'
    const {
        page,
        setPage,
        limit,
        setLimit,
        loadData,
        typedQuery,
        setTypedQuery,
        setLoadData,
        handleRefresh,
        handleKeyDown,
    } = useTableStore((state) => state.users);

    /**
     * Fungsi Fetch Utama dengan Parameter Terpaginasi Dinamis.
     * Dibungkus dengan useCallback demi efisiensi dependensi efek dan kelulusan SonarQube.
     */

    const rawColumnsConfig = [
        ["no", "NO", "w-12 text-center text-slate-500"],
        ["username", "Username", "font-semibold text-slate-800"],
        ["first_name", "Nama Depan", "text-slate-700"],
        ["phone", "No. Telepon", "text-slate-600 font-medium"],
        ["group_name", "Group", "w-28 font-mono text-slate-500 font-medium"],
    ] as const;

    /**
     * 2. Lakukan pemetaan otomatis menggunakan .map()
     * Langkah ini membuat SonarQube hanya membaca 1 baris token properti, bukan 5 baris berulang!
     */
    const baseColumns: ColumnProps<TableUsers>[] = rawColumnsConfig.map(
        ([key, header, className]) => ({
            key: key as keyof TableUsers | "actions",
            header,
            className,
        }),
    );
    const fetchData = useCallback(
        async (
            targetPage: number,
            targetLimit: number,
            searchQuery: string,
        ) => {
            try {
                setLoadData(true);
                const requestBody = {
                    page: targetPage,
                    limit: targetLimit,
                    search: searchQuery.trim(),
                };

                const response = await fetch(
                    "/configuration/users/api/get_data",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestBody),
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Gagal mengambil data (HTTP ${response.status})`,
                    );
                }

                const result = await response.json();

                if (result.success) {
                    // Kalkulasi penomoran baris dinamis (NO) berdasarkan indeks halaman server
                    const dataTerkonversi: TableUsers[] = (
                        result.data || []
                    ).map((item: any, index: number) => ({
                        ...item,
                        id: item.id,
                        no: (targetPage - 1) * targetLimit + index + 1,
                    }));

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
        [triggerNotification, setLoadData], // Tambahkan setLoadData ke dependensi
    );

    // Memicu Fetch data otomatis setiap kali state page atau limit berubah dari store
    useEffect(() => {
        fetchData(page, limit, typedQuery);
    }, [page, limit, fetchData]);

    const columns: ColumnProps<TableUsers>[] = useMemo(
        () => [
            ...baseColumns, // 🌟 Masukkan baseColumns agar kolom Username, Nama Depan, dll. ikut muncul

            // Kolom Status
            {
                key: "status",
                header: "STATUS",
                className: "text-center w-28",
                render: (row) => {
                    const isStatusActive = String(row.status) === "1";
                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                isStatusActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {isStatusActive ? "Aktif" : "Non Aktif"}
                        </span>
                    );
                },
            },

            // Kolom Aksi
            {
                key: "actions",
                header: "AKSI",
                className:
                    "text-center whitespace-nowrap text-xs font-semibold",
                render: (row) => (
                    <div className="flex flex-row items-center gap-1.5">
                        <Btn
                            type="button"
                            variant="info"
                            size="xs"
                            title="edit"
                        >
                            <CrudIcons name="edit" size={10} />
                        </Btn>

                        <Btn
                            type="button"
                            variant="success"
                            size="xs"
                            title="Aktif"
                        >
                            <CrudIcons name="active" size={10} />
                        </Btn>

                        <Btn
                            type="button"
                            variant="delete"
                            size="xs"
                            title="Non Aktif"
                        >
                            <CrudIcons name="inactive" size={10} />
                        </Btn>

                        <Btn
                            type="button"
                            variant="delete"
                            size="xs"
                            title="Delete"
                        >
                            <CrudIcons name="delete" size={10} />
                        </Btn>
                    </div>
                ),
            },
        ],
        [],
    );
    const loadAdd = async () => {
        openModal("Form Add");
        await fetchBulkMasterOptions(
            "/configuration/users/api/crud",
            [
                {
                    key: "group",
                    transform: (apiResponse) => {
                        const dataArray = apiResponse?.group || [];
                        return dataArray.map((item: any) => ({
                            value: item.id.toString(),
                            label: item.name,
                        }));
                    },
                },
            ],
            triggerNotification,
        );
    };

    const loadEdit = async () => {
        openModal("Form Edit");
        await fetchBulkMasterOptions(
            "/configuration/users/api/crud",
            [
                {
                    key: "group",
                    transform: (apiResponse) => {
                        const dataArray = apiResponse?.group || [];
                        return dataArray.map((item: any) => ({
                            value: item.id.toString(),
                            label: item.name,
                        }));
                    },
                },
            ],
            triggerNotification,
        );
    };

    return (
        <div className="p-6 w-full space-y-6 text-slate-800 min-h-screen bg-slate-50/50">
            {/* HEADER */}
            <Modal
                id="Form Add"
                title="Tambah Data Pengguna"
                size="3xl"
                isBackdropLoading={isFetchLoading}
            >
                <Add formId="Form Add" />
            </Modal>

            <div className="flex flex-row items-center justify-between w-full gap-4">
                {/* Bagian Kiri: Judul dan Deskripsi Modul */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {moduleName}
                    </h1>
                    <p className="text-sm text-slate-400">
                        Pusat kendali data jaringan pelabuhan, kapasitas
                        dermaga, dan status operasional.
                    </p>
                </div>
                {/* Bagian Kanan: Tombol Aksi */}

                <Btn
                    type="button"
                    variant="primary"
                    size="sm"
                    title="Tambah"
                    onClick={() => loadAdd()}
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
                            onKeyDown={(e) => handleKeyDown(e, fetchData)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-r-lg rounded-l-none h-8.5 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:z-20 transition-all shadow-sm -ml-px"
                        />
                    </div>
                    <Btn
                        type="button"
                        variant="delete"
                        isLoading={loadData}
                        size="sm"
                        onClick={() => handleRefresh(fetchData)}
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
