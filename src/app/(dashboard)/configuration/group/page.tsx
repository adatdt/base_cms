"use client";

import { useCallback, useEffect, useState } from "react";
import { Table } from "./interfaces/group.interfaces";
import DataGrid from "@/components/ui/DataGrid";
import { useTableStore } from "@/store/useTableStore";
import { fetchClient, FetchError } from "@/services/fetch-client";
import { ApiTableResponse } from "@/types/api.types";
import { useNotificationStore } from "@/store/useNotificationStore";
import Btn from "@/components/ui/Btn";
import { useModalStore } from "@/store/useModalStore";
import { ModalListRenderer } from "@/components/ui/ModalRenderer";
import Add from "./components/Add";
import { useFormStore } from "@/store/useFormStore";
import { useShallow } from "zustand/shallow";
import Edit from "./components/Edit";
import { useGroupColumns } from "./hooks/useGroupColumns";
import Icons from "@/components/ui/Icons";
import Filter from "./components/Filter";

const moduleName = `Group`;

export default function GroupPage() {
    const [tableData, setTableData] = useState<Table[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );
    const openModal = useModalStore((state) => state.openModal);

    const { isFetchLoading, formData } = useFormStore(
        useShallow((state) => ({
            isFetchLoading: state.isFetchLoading,
            formData: state.formData,
        })),
    );

    const {
        page,
        setPage,
        limit,
        setLimit,
        loadData,
        typedQuery,
        setTypedQuery,
        setLoadData,
    } = useTableStore((state) => state.getTableState("group"));

    const loadAdd = async () => openModal("Form Add");
    const loadEdit = async () => openModal("Form Edit");
    const changeStatus = (id: string | number) =>
        console.log("Ubah status id:", id);

    const columns = useGroupColumns({
        onEdit: loadEdit,
        onChangeStatus: changeStatus,
    });

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
                    "/api/group/get_data",
                    {
                        method: "POST",
                        data: requestBody,
                    },
                );
                if (result.status && result.code >= 200 && result.code < 300) {
                    const dataTerkonversi: Table[] = (
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
        [triggerNotification, setLoadData],
    );

    useEffect(() => {
        fetchData(page, limit, typedQuery);
    }, [page, limit, fetchData]);

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

            {/* Implementasi DataGrid menggunakan kolom hasil pemisahan */}
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
