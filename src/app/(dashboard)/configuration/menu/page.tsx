"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import DynamicTreeGrid from "@/components/ui/DynamicTreeGrid";
import Add from "./components/Add";
import Btn from "@/components/ui/Btn";
import type { TreeGridColumn } from "@/types/treeGrid.type";
import { useModalStore } from "@/store/useModalStore";
import Edit from "./components/Edit";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import {
    DocumentData,
    MyApiDetails,
    MyComponentFields,
    RawDatabaseMenu,
} from "./interfaces/menu.interfaces";
import { DropdownBtn } from "@/components/ui/DropdownBtn";
import Icons from "@/components/ui/Icons";
import Filter from "./components/Filter";
import { useTableStore } from "@/store/useTableStore";
import { ModalListRenderer } from "@/components/shared/ModalRenderer";

const moduleName = `Menu`;

export default function MenuPage() {
    const [data, setData] = useState<DocumentData[]>([]);
    const [localSearch, setLocalSearch] = useState("");
    // Ambil seluruh state pengendali modal dari Zustand
    const openModal = useModalStore((state) => state.openModal);
    const fetchFormDetails = useFormStore((state) => state.fetchFormDetails);
    const fetchBulkMasterOptions = useFormStore(
        (state) => state.fetchBulkMasterOptions,
    );
    const { formData } = useFormStore();

    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );
    const isFetchLoading = useFormStore((state) => state.isFetchLoading);

    const { loadData, setLoadData, typedQuery, setTypedQuery } = useTableStore(
        (state) => state.getTableState("menu"),
    );

    const handleSearchSubmit = (value: string) => {
        setTypedQuery(value); // Sinkronisasi nilai final ke Zustand
    };

    const fetchData = useCallback(async () => {
        try {
            setLoadData(true);
            // 2. Menggunakan metode GET dengan menyisipkan query string di ujung URL
            const response = await fetch(`/configuration/menu/api/get_data?`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Gagal mengambil data (HTTP ${response.status})`,
                );
            }
            const result = await response.json();
            setData(convertToTreeGridData(result.data));
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan jaringan atau sistem.";
        } finally {
            setLoadData(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Fungsi penanganan klik yang stabil di level Page
    const handleEdit = useCallback((row: DocumentData) => {
        console.log("Membuka form edit untuk Dokumen ID:", row.id);
    }, []);

    const handleDelete = useCallback((row: DocumentData) => {
        console.log("Menghapus Dokumen ID:", row.id);
    }, []);

    // 3. Panggil di dalam komponen Anda
    const loadEdit = async (menuId: string | number) => {
        openModal("Form Edit");
        const urlDetail = `/configuration/menu/api/crud/${menuId}`;
        await fetchBulkMasterOptions(
            "/configuration/menu/api/crud",
            [
                {
                    key: "action",
                    transform: (apiResponse) => {
                        // 💡 Masuk langsung ke objek target yang spesifik (data.items)
                        const dataArray = apiResponse?.action || [];
                        return dataArray.map((item: any) => ({
                            value: item.id.toString(),
                            label: item.action_name,
                        }));
                    },
                },
                {
                    key: "parent",
                    transform: (apiResponse) => {
                        // 💡 Masuk langsung ke objek target yang spesifik (data.items)
                        const dataArray = apiResponse?.menu || [];
                        return dataArray.map((item: any) => ({
                            value: item.id.toString(),
                            label: item.name,
                            parent: item.parent_id?.toString() || null,
                        }));
                    },
                },
            ],
            triggerNotification,
            "GET",
        );
        await fetchFormDetails<MyApiDetails, MyComponentFields>(
            menuId,
            triggerNotification,
            // Pastikan semua properti yang ada di MyComponentFields terpenuhi di sini
            (apiData) => ({
                menu: apiData.name, // Memetakan 'name' dari API ke 'menu' komponen
                icon: apiData.icon, // Langsung dipasangkan karena namanya sama
                order: apiData.order, // Langsung dipasangkan karena namanya sama
                parent: String(apiData.parent_id),
                parent_selected: apiData.parent_name, // Langsung dipasangkan karena namanya sama
                url: apiData.slug,
                action: apiData.action_id.map(String) || [],
                action_selected: apiData.action_name.map(String) || [],
            }),
            urlDetail, // Gunakan URL kustom untuk fetch detail
        );
    };

    const loadAdd = async () => {
        openModal("Form Add");

        await fetchBulkMasterOptions(
            "/configuration/menu/api/crud",
            [
                {
                    key: "action",
                    transform: (apiResponse) => {
                        // 💡 Masuk langsung ke objek target yang spesifik (data.items)
                        const dataArray = apiResponse?.action || [];
                        return dataArray.map((item: any) => ({
                            value: item.id.toString(),
                            label: item.action_name,
                        }));
                    },
                },
                {
                    key: "parent",
                    transform: (apiResponse) => {
                        // 💡 Masuk langsung ke objek target yang spesifik (data.items)
                        const dataArray = apiResponse?.menu || [];
                        return dataArray.map((item: any) => ({
                            value: item.id.toString(),
                            label: item.name,
                            parent: item.parent_id?.toString() || null,
                        }));
                    },
                },
            ],
            triggerNotification,
        );
    };

    // Definisikan kolom beserta implementasi kustom render AKSI di level Page
    const columns: TreeGridColumn<DocumentData>[] = useMemo(
        () => [
            {
                key: "name",
                header: "Nama Menu",
                className: "w-full",
                isTreeField: true,
            },
            {
                key: "actions",
                header: " ",
                className: "text-center whitespace-nowrap w-[1%] px-2",
                // MENARUH KONTEN TOMBOL AKSI LANGSUNG DI FILE PAGE:
                render: (row) => (
                    <DropdownBtn
                        variant="ghost"
                        trigger={<Icons name="more-vertical" size={15} />}
                        items={[
                            {
                                label: "Edit ",
                                fontWeight: "normal",
                                fontSize: "xs",
                                onClick: () => loadEdit(row.id), // Passing row data jika dibutuhkan
                            },
                            {
                                label: "Hapus",
                                fontWeight: "normal",
                                fontSize: "xs",
                                onClick: () => handleDelete(row),
                            },
                        ]}
                        widthClass="w-48"
                        alignClass="right-0"
                    />
                ),
            },
        ],
        [handleEdit, handleDelete],
    );

    const convertToTreeGridData = (rawMenus: RawDatabaseMenu[]) => {
        if (!rawMenus || rawMenus.length === 0) return [];

        // 1. Buat Set berisi kumpulan semua parent_id yang ada untuk mempercepat pencarian (O(1))
        const parentIdsSet = new Set(
            rawMenus
                .map((item) => item.parent_id)
                .filter((pId) => pId !== null && pId !== undefined),
        );

        // 2. Map data seperti biasa
        return rawMenus.map((item) => {
            // Jika ID saat ini terdaftar di dalam kumpulan parentIdsSet, berarti dia PUNYA CHILD (bukan Leaf)
            const hasChild = parentIdsSet.has(item.id);
            const isLeaf = !hasChild; // Leaf adalah item yang TIDAK memiliki anak

            return {
                id: item.id,
                parentId: item.parent_id,
                isLeaf: isLeaf,
                name: item.name,
                href: item.slug,
                order: item.order,
                owner: "System",
            };
        });
    };

    const modalConfigurations = [
        {
            id: "Form Add",
            title: `Tambah Data ${moduleName}`,
            variant: `side-slide`,
            renderContent: (formId: string) => <Add formId={formId} />,
        },
        {
            id: "Form Edit",
            title: `Ubah Data ${moduleName}`,
            variant: `side-slide`,
            renderContent: (formId: string) => (
                <Edit formId={formId} key={formData?.menu || "modal-kosong"} />
            ),
        },
    ];

    return (
        // <div className="p-8">
        //   <DynamicTreeGrid columns={columns} data={data} />
        // </div>
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
                        searchValue={localSearch}
                        isLoading={loadData}
                        onReset={() => {
                            setTypedQuery("");
                            setLocalSearch("");
                        }}
                        onSearchChange={(value) => {
                            setLocalSearch(value);
                        }}
                        onApply={() => handleSearchSubmit(localSearch)}
                    />
                    <Btn
                        type="button"
                        variant="success-blue"
                        size="md"
                        title="Tambah"
                        onClick={() => loadAdd()}
                    >
                        <Icons name="add" size={15} />
                        Tambah
                    </Btn>
                </div>
            </div>

            <DynamicTreeGrid
                columns={columns}
                data={data}
                searchValue={typedQuery}
                isLoading={loadData}
            />
        </div>
    );
}
