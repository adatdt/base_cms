"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import DynamicTreeGrid from "@/components/ui/DynamicTreeGrid";
import Add from "./components/Add";
import Btn from "@/components/ui/Btn";
import CrudIcons from "@/components/ui/CrudIcons";
import type { TreeGridColumn } from "@/interfaces/treeGrid";
import Modal from "@/components/ui/Modal";
import { useModalStore } from "@/store/useModalStore";

const moduleName = `Menu`;

interface DocumentData {
    id: number | string;
    parentId: number | string | null;
    isLeaf: boolean;
    name: string;
    owner: string;
}

interface RawDatabaseMenu {
    id: number | string;
    parent_id: number | string | null;
    name: string;
    slug: string;
    order: number;
}

export default function MenuPage() {
    const [data, setData] = React.useState<DocumentData[]>([]);
    // Ambil seluruh state pengendali modal dari Zustand
    const openModal = useModalStore((state) => state.openModal);
    const closeModal = useModalStore((state) => state.closeModal);

    const handleFormSubmit = async (data: any) => {
        console.log("Kirim ke API:", data);
        closeModal();
    };
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
                            onClick={() => openModal("Form Edit")}
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
                size="5xl"
                // confirmLoading={loading}
            >
                {/* 3. Masukkan Form Fields yang otomatis menyasar formId "Form Add" */}
                <Add formId="Form Add" onSubmit={handleFormSubmit} />
            </Modal>

            <Modal
                id="Form Edit"
                title="Edit Data Pengguna"
                size="5xl"
                // confirmLoading={loading}
            >
                {/* 3. Masukkan Form Fields yang otomatis menyasar formId "Form Edit" */}
                <Add formId="Form Edit" onSubmit={handleFormSubmit} />
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
                    onClick={() => openModal("Form Add")}
                >
                    <CrudIcons name="add" size={15} />
                    Tambah
                </Btn>
            </div>

            <DynamicTreeGrid columns={columns} data={data} />
        </div>
    );
}
