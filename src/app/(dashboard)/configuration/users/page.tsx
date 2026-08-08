"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataGrid, { ColumnProps } from "@/components/ui/DataGrid";
import Btn from "@/components/ui/Btn";
import type { TableUsers } from "./interfaces/users.interfaces";
import CrudIcons from "@/components/ui/CrudIcons";
import SidePanel from "@/components/ui/SidePanel";
import { useModalStore } from "@/store/useModalStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useTableStore } from "@/store/useTableStore";
import Add from "./components/Add";
import { useFormStore } from "@/store/useFormStore";
import { useShallow } from "zustand/shallow";
import { DropdownBtn } from "@/components/ui/DropdownBtn";
import Edit from "./components/Edit";
import { fetchClient, FetchError } from "@/services/fetch-client";
import { useStoreTitle } from "@/store/useStoreTitle";

const moduleName = `Users`;
interface ApiFetchResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    total_data?: number;
}

export default function PortBranchPage() {
    const [tableData, setTableData] = useState<TableUsers[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );

    const { setActiveModule } = useStoreTitle(
        useShallow((state) => ({
            setActiveModule: state.setActiveModule,
        })),
    );
    setActiveModule(moduleName);

    // Ambil seluruh state pengendali modal dari Zustand
    const openModal = useModalStore((state) => state.openModal);
    const { isFetchLoading, formData } = useFormStore(
        useShallow((state) => ({
            isFetchLoading: state.isFetchLoading,
            formData: state.formData, // 🌟 Tambahkan baris ini untuk mengambil formData
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
        ["no", "NO", "font-semibold text-slate-800"],
        ["username", "Username", "font-semibold text-slate-800"],
        ["first_name", "Nama Depan", "font-semibold text-slate-800"],
        ["phone", "No. Telepon", "font-semibold text-slate-800"],
        ["group_name", "Group", "font-semibold text-slate-800"],
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
                const result = await fetchClient.request<ApiFetchResponse<any>>(
                    "/configuration/users/api/get_data",
                    {
                        method: "POST",
                        data: requestBody,
                    },
                );

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
                    triggerNotification(
                        result.message || "Gagal memuat data.",
                        "warning",
                    );
                }
            } catch (error: any) {
                // 🚀 3. Penanganan error yang pintar menggunakan struktur FetchError bawaan library Anda
                let errorMessage = "Terjadi kesalahan jaringan atau sistem.";

                if (error && typeof error === "object" && "status" in error) {
                    // Ini adalah error yang dilempar oleh fetchClient (tipe FetchError)
                    const fetchError = error as FetchError;
                    errorMessage =
                        fetchError.data?.message ||
                        `Gagal mengambil data (HTTP ${fetchError.status})`;
                } else if (error instanceof Error) {
                    // Ini adalah error JavaScript biasa atau kesalahan runtime lainnya
                    errorMessage = error.message;
                }

                triggerNotification(errorMessage, "error");
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
            ...baseColumns,
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
                header: "",
                className:
                    " text-right whitespace-nowrap text-xs font-semibold",
                render: (row) => (
                    <DropdownBtn
                        className="text-slate-400 hover:text-slate-600 active:text-slate-700"
                        variant="ghost"
                        trigger={<CrudIcons name="more-vertical" size={10} />}
                        items={[
                            {
                                label: "Edit Profil",
                                fontWeight: "normal",
                                fontSize: "xs",
                                onClick: () => loadEdit(),
                            },
                            {
                                label: "NON AKTIF",
                                fontWeight: "normal",
                                fontSize: "xs",
                                onClick: () => loadEdit(),
                            },
                        ]}
                        widthClass="w-48"
                        alignClass="right-0"
                    />
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

    const modalConfigurations = [
        {
            id: "Form Add",
            title: "Tambah Data Pengguna",
            renderContent: (formId: string) => <Add formId={formId} />,
        },
        {
            id: "Form Edit",
            title: "Ubah Data Pengguna",
            renderContent: (formId: string) => (
                <Edit formId={formId} key={formData?.menu || "modal-kosong"} />
            ),
        },
    ];

    return (
        <div className="p-6 w-full space-y-6 text-slate-800 min-h-screen bg-slate-50/50">
            {/* HEADER */}
            {modalConfigurations.map((modal) => (
                <SidePanel
                    key={modal.id} // 🌟 Key unik wajib untuk kestabilan Virtual DOM React
                    id={modal.id}
                    title={modal.title}
                    size="3xl"
                    isBackdropLoading={isFetchLoading}
                >
                    {modal.renderContent(modal.id)}
                </SidePanel>
            ))}

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

                <div className="flex items-center gap-2 flex-nowrap">
                    <DropdownBtn
                        size="md"
                        variant="default"
                        className="text-slate-400 hover:text-slate-600"
                        trigger={
                            <>
                                Filter
                                <CrudIcons name="filter" size={15} />
                            </>
                        }
                        items={[
                            // 1. Menu Teks Biasa
                            {
                                label: "Edit Profil",
                                fontWeight: "medium",
                                onClick: () => console.log("Edit diklik"),
                            },
                            // 2. Baris Berisi Komponen Input Teks (Form)
                            {
                                closeOnItemClick: false, // WAJIB: Agar saat kolom input diklik, dropdown tidak menutup
                                className: "hover:bg-transparent", // Matikan hover abu-abu untuk form
                                label: (
                                    <div className="flex flex-col gap-1">
                                        <label
                                            htmlFor="quick_search"
                                            className="text-xs font-semibold text-slate-500"
                                        >
                                            Cari Cepat
                                        </label>
                                        <input
                                            type="text"
                                            name="quick_search"
                                            placeholder="Ketik nama kelompok..."
                                            className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500"
                                            onChange={(e) =>
                                                console.log(e.target.value)
                                            }
                                        />
                                    </div>
                                ),
                            },
                            // 3. Baris Berisi Checkbox / Pilihan Status
                            {
                                closeOnItemClick: false,
                                label: (
                                    <label className="flex items-center gap-2 cursor-pointer py-1">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300"
                                        />
                                        <span className="text-sm text-slate-600">
                                            Sembunyikan dari Publik
                                        </span>
                                    </label>
                                ),
                            },
                            // 4. Menu Tombol Aksi Hapus
                            {
                                label: "Hapus Kelompok",
                                fontWeight: "bold",
                                className: "text-red-600 hover:bg-red-50 mt-1",
                                onClick: () => confirm("Hapus data ini?"),
                            },
                        ]}
                        widthClass="w-56"
                        alignClass="right-0"
                    />

                    <Btn
                        type="button"
                        variant="success-blue"
                        size="md"
                        title="Tambah Data"
                        onClick={() => loadAdd()}
                        className="shrink-0"
                    >
                        <CrudIcons name="add" size={15} />
                        Tambah
                    </Btn>
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
