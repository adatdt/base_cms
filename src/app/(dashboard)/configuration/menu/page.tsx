"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import DynamicTreeGrid from "@/components/ui/DynamicTreeGrid";
import Add from "./components/Add";
import Btn from "@/components/ui/Btn";
import CrudIcons from "@/components/ui/CrudIcons";
import type { TreeGridColumn } from "@/types/treeGrid.type";
import Modal from "@/components/ui/Modal";
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

const moduleName = `Menu`;

export default function MenuPage() {
    const [data, setData] = React.useState<DocumentData[]>([]);
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

    const fetchData = useCallback(async () => {
        try {
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
            console.log(result.data);
            setData(convertToTreeGridData(result.data));
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan jaringan atau sistem.";
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
                header: "AKSI",
                className: "text-center whitespace-nowrap w-[1%] px-2",
                // MENARUH KONTEN TOMBOL AKSI LANGSUNG DI FILE PAGE:
                render: (row) => (
                    <div className="flex justify-center gap-1.5">
                        <Btn
                            type="button"
                            variant="info"
                            size="xs"
                            title="Edit"
                            onClick={() => loadEdit(row.id)}
                        >
                            <CrudIcons name="edit" size={10} />
                        </Btn>
                        <Btn
                            type="button"
                            variant="delete"
                            size="xs"
                            title="Hapus"
                            onClick={() => handleDelete(row)}
                        >
                            <CrudIcons name="delete" size={10} />
                        </Btn>
                    </div>
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

    return (
        // <div className="p-8">
        //   <DynamicTreeGrid columns={columns} data={data} />
        // </div>
        <div className="p-6 w-full space-y-6 text-slate-800 min-h-screen bg-slate-50/50">
            {/* HEADER */}
            <Modal
                id="Form Add"
                title="Tambah Data Pengguna"
                size="sm"
                isBackdropLoading={isFetchLoading}
                // confirmLoading={loading}
            >
                {/* 3. Masukkan Form Fields yang otomatis menyasar formId "Form Add" */}
                <Add formId="Form Add" />
            </Modal>

            <Modal
                id="Form Edit"
                title="Edit Data Pengguna"
                // size="5xl"
                isBackdropLoading={isFetchLoading}

                // confirmLoading={loading}
            >
                {/* 3. Masukkan Form Fields yang otomatis menyasar formId "Form Edit" */}
                <Edit
                    formId="Form Edit"
                    key={formData.menu || "modal-kosong"}
                />
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
                    variant="success-blue"
                    size="sm"
                    title="Tambah"
                    onClick={() => loadAdd()}
                >
                    <CrudIcons name="add" size={15} />
                    Tambah
                </Btn>
            </div>

            <DynamicTreeGrid columns={columns} data={data} />
        </div>
    );
}
