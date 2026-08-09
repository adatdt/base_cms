"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Table } from "./interfaces/group.interfaces";
import DataGrid, { ColumnProps } from "@/components/ui/DataGrid";
import { useTableStore } from "@/store/useTableStore";
import { fetchClient, FetchError } from "@/services/fetch-client";
import { ApiFetchResponse } from "@/types/api.types";
import { useNotificationStore } from "@/store/useNotificationStore";
import { DropdownBtn } from "@/components/ui/DropdownBtn";
import CrudIcons from "@/components/ui/CrudIcons";
import Btn from "@/components/ui/Btn";
import { useModalStore } from "@/store/useModalStore";
import { ModalListRenderer } from "@/components/ui/ModalRenderer";
import Add from "./components/Add";
import { useFormStore } from "@/store/useFormStore";
import { useShallow } from "zustand/shallow";
import Edit from "./components/Edit";

// 1. React Core Hooks

const moduleName = `Group`;
   
const rawColumnsConfig = [
        ["no", "NO", "font-semibold text-slate-800"],
        ["name", "Nama", "font-semibold text-slate-800"],
    ] as const;


export default function UsersPage() {

        const [tableData, setTableData] = useState<Table[]>([]);
        const [totalRecords, setTotalRecords] = useState<number>(0);
        const triggerNotification = useNotificationStore(
                (state) => state.triggerNotification,
            );
        const openModal = useModalStore((state) => state.openModal);
        const { isFetchLoading, formData } = useFormStore(
                useShallow((state) => ({
                    isFetchLoading: state.isFetchLoading,
                    formData: state.formData, // 🌟 Tambahkan baris ini untuk mengambil formData
                })),
            );
            const {
                page,
                setPage,
                limit,
                setLimit,
                loadData,
                typedQuery,
                setLoadData,
            } = useTableStore((state) => state.users);

            const baseColumns: ColumnProps<Table>[] = rawColumnsConfig.map(
                    ([key, header, className]) => ({
                        key: key as keyof Table | "actions",
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
                                "/api/group/get_data",
                                {
                                    method: "POST",
                                    data: requestBody,
                                },
                            );
            
                            if (result.success) {
                                // Kalkulasi penomoran baris dinamis (NO) berdasarkan indeks halaman server
                                const dataTerkonversi: Table[] = (
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
                            let errorMessage = "Terjadi kesalahan jaringan atau sistem.";
                            if (error && typeof error === "object" && "status" in error) {
                                const fetchError = error as FetchError;
                                errorMessage =
                                    fetchError.data?.message ||
                                    `Gagal mengambil data (HTTP ${fetchError.status})`;
                            } else if (error instanceof Error) {
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
            
                const columns: ColumnProps<Table>[] = useMemo(
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
                              const statusLabel = String(row.status) === "1"?"Non Aktifkan":"Aktifkan";
                            return (
                              
                               
                                <DropdownBtn
                                    className="text-slate-400 hover:text-slate-600 active:text-slate-700"
                                    variant="ghost"
                                    trigger={<CrudIcons name="more-vertical" size={10} />}
                                    items={[
                                        {
                                            label: "Edit ",
                                            fontWeight: "normal",
                                            fontSize: "xs",
                                            onClick: () => loadEdit(),
                                        },
                                        {
                                            label: statusLabel,
                                            fontWeight: "normal",
                                            fontSize: "xs",
                                            // onClick: () => changeStatus(row.id),
                                        },
                                    ]}
                                    widthClass="w-48"
                                    alignClass="right-0"
                                />
                            )},
                        },
                    ],
                    [],
                );
        
        const loadAdd = async () => {
        openModal("Form Add");
    };
     const loadEdit = async () => {
        openModal("Form Edit");
    };

        const modalConfigurations = [
            {
                id: "Form Add",
                title: `Tambah Data ${moduleName}`,
                renderContent: (formId: string) => <Add formId={formId} />,
            },
            {
                id: "Form Edit",
                title: `Ubah Data ${moduleName}`,
                renderContent: (formId: string) => (
                    <Edit formId={formId} key={formData?.menu || "modal-kosong"} />
                ),
            },
        ];
   
    return (
        <div className="p-6 w-full space-y-6 text-slate-800 min-h-screen bg-slate-50/50">
            
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
