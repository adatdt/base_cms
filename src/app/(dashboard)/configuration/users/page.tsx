"use client";

// 1. React Core Hooks
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import DataGrid, { ColumnProps } from "@/components/ui/DataGrid";
import Btn from "@/components/ui/Btn";
import Icons from "@/components/ui/Icons";
import { DropdownBtn } from "@/components/ui/DropdownBtn";
import { ModalListRenderer } from "@/components/ui/ModalRenderer";
import { useFormStore } from "@/store/useFormStore";
import { useModalStore } from "@/store/useModalStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useStoreTitle } from "@/store/useStoreTitle";
import { useTableStore } from "@/store/useTableStore";
import { fetchClient, FetchError } from "@/services/fetch-client";
import Add from "./components/Add";
import Edit from "./components/Edit";
import type { TableUsers } from "./interfaces/users.interfaces";
import type { ApiTableResponse } from "@/types/api.types";
import Filter from "./components/Filter";

const moduleName = `Users`;
const rawColumnsConfig = [
    ["no", "NO", "font-semibold text-slate-800"],
    ["username", "Username", "font-semibold text-slate-800"],
    ["first_name", "Nama Depan", "font-semibold text-slate-800"],
    ["phone", "No. Telepon", "font-semibold text-slate-800"],
    ["group_name", "Group", "font-semibold text-slate-800"],
] as const;

export default function UsersPage() {
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
    } = useTableStore((state) => state.getTableState("user"));

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
            targetPage: number, // start page
            targetLimit: number, // limit page
            searchQuery: string,
        ) => {
            try {
                setLoadData(true);
                const requestBody = {
                    start: targetPage,
                    length: targetLimit,
                    search: searchQuery.trim(),
                    order: "desc",
                    column: "id",
                };
                const result = await fetchClient.request<ApiTableResponse<any>>(
                    "/configuration/users/api/get_data",
                    {
                        method: "POST",
                        data: requestBody,
                    },
                );

                if (result.status && result.code >= 200 && result.code < 300) {
                    const dataTerkonversi: TableUsers[] = (
                        result.data.records || []
                    ).map((item: any, index: number) => ({
                        ...item,
                        id: item.id,
                        no: (targetPage - 1) * targetLimit + index + 1,
                    }));
                    const recordsTotal = result.data.recordsTotal;
                    setTableData(dataTerkonversi);
                    setTotalRecords(Number(recordsTotal) || 0);
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
                render: (row) => {
                    const statusLabel =
                        String(row.status) === "1"
                            ? "Non Aktifkan"
                            : "Aktifkan";
                    return (
                        <DropdownBtn
                            className="text-slate-400 hover:text-slate-600 active:text-slate-700"
                            variant="ghost"
                            trigger={<Icons name="more-vertical" size={10} />}
                            items={[
                                {
                                    label: "Edit Profil",
                                    fontWeight: "normal",
                                    fontSize: "xs",
                                    onClick: () => loadEdit(),
                                },
                                {
                                    label: statusLabel,
                                    fontWeight: "normal",
                                    fontSize: "xs",
                                    onClick: () => changeStatus(row.id),
                                },
                            ]}
                            widthClass="w-48"
                            alignClass="right-0"
                        />
                    );
                },
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

    const changeStatus = async (params: string) => {
        openModal("Form Aktif");
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
        {
            id: "Form Aktif",
            title: "",
            renderContent: (formId: string) => "Apa Yakin ingin hapus data ini",
        },
    ];

    return (
        <div className="p-6 w-full space-y-6 text-slate-800 min-h-screen bg-slate-50/50">
            {/* HEADER */}
            <ModalListRenderer
                configs={modalConfigurations}
                isLoading={isFetchLoading}
            />

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
                    <Filter
                        // Mengambil nilai string pencarian dinamis dari store Zustand Anda
                        searchValue={typedQuery}
                        // Mengubah nilai di store saat pengguna mengetik huruf demi huruf
                        onSearchChange={(value) => {
                            // Contoh: panggil fungsi store Anda di sini
                            setTypedQuery(value);
                        }}
                        // Eksekusi trigger pemicu prapemrosesan data ke server API
                        onApply={() => {
                            fetchData(1, limit, typedQuery);
                        }}
                        isLoading={loadData}
                        // Mengosongkan kembali kolom input ketika tombol Kembali diklik
                        onReset={() => {
                            setTypedQuery(""); // Mengosongkan text input dari depan secara otomatis
                        }}
                    />

                    <Btn
                        type="button"
                        variant="success-blue"
                        size="md"
                        title="Tambah Data"
                        onClick={() => loadAdd()}
                        className="shrink-0"
                    >
                        <Icons name="add" size={15} />
                        Tambah
                    </Btn>
                </div>
            </div>

            {/* CONTROL BAR */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center w-full">
                {/* <div className="flex flex-1 items-center gap-2 max-w-md w-full">
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
                        <Icons name="search" size={15} />
                        <span className="whitespace-nowrap block">Cari</span>
                    </Btn>
                </div> */}
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
