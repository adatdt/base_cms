"use client";

import { useCallback, useEffect, useState } from "react";
import { Table } from "./interfaces/provider.interfaces";
import DataGrid from "@/components/ui/DataGrid";
import { useTableStore } from "@/store/useTableStore";
import { fetchClient, FetchError } from "@/services/fetch-client";
import { ApiTableResponse } from "@/types/api.types";
import { useNotificationStore } from "@/store/useNotificationStore";
import Btn from "@/components/ui/Btn";
import { useModalStore } from "@/store/useModalStore";
import {
    ModalListRenderer,
    type ModalConfig,
} from "@/components/shared/ModalRenderer";
import Add from "./components/Add";
import { useFormStore } from "@/store/useFormStore";
import { useShallow } from "zustand/shallow";
import Edit from "./components/Edit";
import { useBussinesCategoryColumns } from "./hooks/useProvider";
import Icons from "@/components/ui/Icons";
import Filter from "./components/Filter";
import { ConfirmationContent } from "@/components/shared/ConfirmationContent";

const moduleName = `Provider`;
const formAdd = `formAdd${moduleName}`;
const formEdit = `formEdit${moduleName}`;
const formChangeStatus = `changeStatus${moduleName}`;

export default function Page() {
    const [tableData, setTableData] = useState<Table[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );
    const openModal = useModalStore((state) => state.openModal);
    const openModalOnly = useModalStore((state) => state.openModalOnly);
    const setManualFormData = useFormStore((state) => state.setManualFormData);
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
    } = useTableStore((state) => state.getTableState("parameter"));

    const loadAdd = async () => openModal(formAdd);
    const loadEdit = async () => {
        openModal(formEdit);

        // set id manual ini hardcord nanti  bisa di set di function fetchFormDetails
        setTimeout(() => {
            setManualFormData({ id: "idnya" });
        }, 0);
    };

    const changeStatus = (id: string | number) => {
        console.log("Ubah status id:", id);
        openModal(formChangeStatus);
    };
    const columns = useBussinesCategoryColumns({
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

    const modalConfigurations: ModalConfig[] = [
        {
            id: formAdd,
            title: `Tambah Data ${moduleName}`,
            renderContent: (formId: string) => <Add formId={formId} />,
            variant: `side-slide`,
        },
        {
            id: formEdit,
            title: `Ubah Data ${moduleName}`,
            renderContent: (formId: string) => {
                return (
                    <Edit
                        formId={formId}
                        key={formData?.menu || "modal-kosong"}
                    />
                );
            },
            variant: `side-slide`,
        },
        {
            id: formChangeStatus,
            title: `Ubah Data ${moduleName}`,
            variant: `modal`,
            showFooter: false,
            sizePanel: "xl",
            renderContent: () => (
                <ConfirmationContent
                    iconType="warning"
                    title="Anda yakin untuk menonaktifkan provider Espay?"
                    description="Cek dua kali sebelum melakukan penonaktifan data, semua data provider yang dinonaktifkan tidak bisa digunakan untuk melakukan transaksi"
                    confirmText="Ya, nonaktifkan data sekarang"
                />
            ),
        },
        {
            id: `${formAdd}Action`,
            title: "Konfirmasi Tambah Data",
            variant: "modal",
            showFooter: false,
            sizePanel: "lg",
            renderContent: () => {
                return (
                    <ConfirmationContent
                        title="Anda yakin untuk melakukan penambahan data provider ini?"
                        description="Pastikan semua data yang Anda masukkan sudah sesuai jika belum sesuai Anda bisa melakukan pengecekan kembali"
                        confirmText="Ya, tambah data sekarang"
                        onCancel={() => openModalOnly(formAdd)}
                    />
                );
            },
        },
        {
            id: `${formEdit}Action`,
            title: "Konfirmasi Edit Data",
            variant: "modal",
            showFooter: false,
            sizePanel: "lg",
            renderContent: () => {
                return (
                    <ConfirmationContent
                        title="Anda yakin untuk melakukan perubahan data provider ini?"
                        description="Pastikan semua data yang Anda ubah sudah sesuai jika belum sesuai Anda bisa melakukan pengecekan kembali"
                        confirmText="Ya, ubah data sekarang"
                        onCancel={() => openModalOnly(formEdit)}
                    />
                );
            },
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
                        searchValue={typedQuery}
                        onSearchChange={(value) => {
                            setTypedQuery(value);
                        }}
                        onApply={() => {
                            fetchData(1, limit, typedQuery);
                        }}
                        isLoading={loadData}
                        onReset={() => {
                            setTypedQuery("");
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
