"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { TreeGridRow, TreeGridColumn } from "@/types/treeGrid.type";
import Icons from "@/components/ui/Icons";
import Skeleton from "./Skeleton";
interface TreeGridProps<T> {
    columns: TreeGridColumn<T>[];
    data: T[];
    isLoading?: boolean;
    searchValue?: string;
}

const getRowIcon = (isLeaf: boolean, isCollapsed: boolean): string => {
    if (isLeaf) return "📄";
    return isCollapsed ? "📁" : "📂";
};

export default function DynamicTreeGrid<
    T extends TreeGridRow & { order?: number; name?: string },
>({
    columns,
    data,
    isLoading = false,
    searchValue = "", // Berikan default value string kosong agar aman dari undefined
}: Readonly<TreeGridProps<T>>) {
    // 1. SINKRONISASI STATE: Gunakan useEffect yang sah untuk memindahkan prop luar ke dalam state lokal
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [collapsedIds, setCollapsedIds] = useState<Set<string | number>>(
        new Set(),
    );

    useEffect(() => {
        setSearchQuery(searchValue.trim().toLowerCase());
    }, [searchValue]);

    // 2. OPTIMASI LOOKUP MAP: Mengonversi array ke Map agar pencarian ID induk berjalan instan (O(1))
    const dataMap = useMemo(() => {
        return new Map<string | number, T>(data.map((item) => [item.id, item]));
    }, [data]);

    // 3. PENAPISAN REKURSIF AMAN (MENJAGA HIERARKI INDUK)
    const filteredData = useMemo(() => {
        // Gunakan nilai searchQuery dari state yang sudah bersih dari spasi dan huruf kapital
        if (!searchQuery) return data;

        const keepIds = new Set<string | number>();

        data.forEach((item) => {
            const matchText = item.name || String(item.id);

            // Jika baris saat ini cocok dengan kata kunci pencarian
            if (matchText.toLowerCase().includes(searchQuery)) {
                keepIds.add(item.id);

                // Tarik seluruh silsilah induk ke atas menggunakan Map secara instan
                let currentParentId = item.parentId;
                while (
                    currentParentId !== null &&
                    currentParentId !== undefined
                ) {
                    keepIds.add(currentParentId);

                    // Kecepatan O(1) - jauh lebih cepat dibanding data.find() bawaan Anda sebelumnya
                    const parentRow = dataMap.get(currentParentId);
                    currentParentId = parentRow ? parentRow.parentId : null;
                }
            }
        });

        return data.filter((item) => keepIds.has(item.id));
    }, [data, searchQuery, dataMap]);

    // 2. ALGORITMA URUTAN HIERARKI (DFS BERDASARKAN ORDER)
    const orderedData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];

        const childrenMap = new Map<string | number | null, T[]>();
        filteredData.forEach((item) => {
            const pId = item.parentId ?? null;
            if (!childrenMap.has(pId)) {
                childrenMap.set(pId, []);
            }
            childrenMap.get(pId)!.push(item);
        });

        childrenMap.forEach((list) => {
            list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        });

        const result: T[] = [];
        const traverse = (parentId: string | number | null) => {
            const children = childrenMap.get(parentId);
            if (!children) return;

            children.forEach((child) => {
                result.push(child);
                traverse(child.id);
            });
        };

        traverse(null);

        if (result.length < filteredData.length) {
            const putInResult = new Set(result.map((r) => r.id));
            filteredData.forEach((item) => {
                if (!putInResult.has(item.id)) {
                    result.push(item);
                }
            });
        }

        return result;
    }, [filteredData]);

    const handleToggle = useCallback((id: string | number) => {
        setCollapsedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const checkIfRowHidden = (row: T): boolean => {
        if (searchQuery?.trim() !== "") return false;

        let currentParentId = row.parentId;
        while (currentParentId !== null && currentParentId !== undefined) {
            if (collapsedIds.has(currentParentId)) return true;
            const parentRow = data.find((item) => item.id === currentParentId);
            currentParentId = parentRow ? parentRow.parentId : null;
        }
        return false;
    };

    const calculateRowLevel = (row: T): number => {
        let calculatedLevel = 0;
        let currentParentId = row.parentId;

        while (currentParentId !== null && currentParentId !== undefined) {
            calculatedLevel++;
            const parentRow = data.find((item) => item.id === currentParentId);
            currentParentId = parentRow ? parentRow.parentId : null;
        }

        return calculatedLevel;
    };

    const renderTableCell = (
        col: any,
        row: any,
        idx: number,
        columnsLength: number,
        isCollapsed: boolean,
        dynamicLevel: number,
        onToggle: (id: string) => void,
    ) => {
        const bodyBorderClasses = `border-b border-slate-100 ${
            idx < columnsLength - 1 ? "border-r border-slate-100" : ""
        }`;
        const baseClassName = `px-6 py-3.5 ${bodyBorderClasses} ${col.className ?? ""}`;

        // Kasus 1: Render Kustom via Properti .render
        if (col.render) {
            return (
                <td key={String(col.key)} className={baseClassName}>
                    {col.render(row)}
                </td>
            );
        }

        // Kasus 2: Render Struktur Pohon (Tree Field)
        if (col.isTreeField) {
            return (
                <td
                    key={String(col.key)}
                    className={`${baseClassName} font-medium text-slate-800`}
                >
                    <div
                        className="flex items-center gap-1"
                        style={{ paddingLeft: `${dynamicLevel * 1.5}rem` }}
                    >
                        {!row.isLeaf ? (
                            <button
                                type="button"
                                onClick={() => onToggle(row.id)}
                                className="p-1 rounded hover:bg-slate-200/60 text-slate-500 transition-colors duration-150 flex items-center justify-center"
                                aria-label={
                                    isCollapsed ? "Buka folder" : "Tutup folder"
                                }
                            >
                                <Icons
                                    name="chevron-triangle"
                                    className={`w-3.5 h-3.5 transform transition-transform duration-200 ease-in-out ${
                                        isCollapsed
                                            ? "-rotate-90 text-slate-400"
                                            : "rotate-0 text-slate-600"
                                    }`}
                                />
                            </button>
                        ) : (
                            <span
                                className="w-5.5 h-5.5 block"
                                aria-hidden="true"
                            />
                        )}
                        <span
                            className="text-slate-400 mr-1"
                            aria-hidden="true"
                        >
                            {getRowIcon(row.isLeaf, isCollapsed)}
                        </span>
                        <span>{row[col.key as string]}</span>
                    </div>
                </td>
            );
        }

        // Kasus 3: Render Teks Standar Biasa
        return (
            <td key={String(col.key)} className={baseClassName}>
                {row[col.key as string]}
            </td>
        );
    };

    // ==========================================
    // 2. FUNGSI UTAMA YANG AKAN DI-RENDER DI DALAM TBODY
    // ==========================================
    const renderTableContent = () => {
        // Penanganan Kondisi 1: Loading State
        if (isLoading) {
            return (
                <tr className="hover:bg-slate-50/80 transition-colors group">
                    <td colSpan={columns.length} className="p-0">
                        <Skeleton
                            totalCount={3}
                            align="left"
                            rows={3}
                            variant="text-only"
                        />
                    </td>
                </tr>
            );
        }

        // Penanganan Kondisi 2: Empty State (Data Kosong)
        if (orderedData.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center text-slate-400 bg-slate-50/50 border-b border-slate-100"
                    >
                        Tidak ada data yang tersedia
                    </td>
                </tr>
            );
        }

        // Penanganan Kondisi 3: Render Baris Berisi Data
        return orderedData.map((row) => {
            if (checkIfRowHidden(row)) return null;

            const isCollapsed = collapsedIds.has(row.id);
            const dynamicLevel = calculateRowLevel(row);

            return (
                <tr
                    key={row.id}
                    className="hover:bg-slate-50/40 transition-colors"
                >
                    {columns.map((col, idx) =>
                        renderTableCell(
                            col,
                            row,
                            idx,
                            columns.length,
                            isCollapsed,
                            dynamicLevel,
                            handleToggle,
                        ),
                    )}
                </tr>
            );
        });
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {/* ================= BAR INPUT PENCARIAN NAMA BERKAS ================= */}
            {/* <div className="relative w-full max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 text-base">
                    🔍
                </span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama berkas atau dokumen..."
                    className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors text-xs"
                        aria-label="Hapus pencarian"
                    >
                        ❌
                    </button>
                )}
            </div> */}

            {/* ================= TABEL TREE GRID ================= */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left border-separate border-spacing-0">
                        <thead className="bg-slate-100/70 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={String(col.key)}
                                        className={`px-6 py-3.5 border-b border-slate-100 ${col.className ?? ""}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {renderTableContent()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
