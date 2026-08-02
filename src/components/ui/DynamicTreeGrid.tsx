"use client";

import React, { useState, useCallback, useMemo } from "react";
import type { TreeGridRow, TreeGridColumn } from "@/interfaces/treeGrid";
import { ChevronTriangleIcon } from "@/components/ui/Icons";

interface TreeGridProps<T> {
  columns: TreeGridColumn<T>[];
  data: T[];
}

const getRowIcon = (isLeaf: boolean, isCollapsed: boolean): string => {
  if (isLeaf) return "📄";
  if (isCollapsed) return "📁";
  return "📂";
};

export default function DynamicTreeGrid<
  T extends TreeGridRow & { order?: number; name?: string },
>({ columns, data }: Readonly<TreeGridProps<T>>) {
  // State untuk melacak teks pencarian langsung di dalam komponen
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collapsedIds, setCollapsedIds] = useState<Set<string | number>>(
    new Set(),
  );

  // 1. FILTER DATA BERDASARKAN PENCARIAN (MENJAGA HIERARKI INDUK)
  const filteredData = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) return data;

    const keepIds = new Set<string | number>();

    data.forEach((item) => {
      const matchText = item.name || String(item.id);
      if (matchText.toLowerCase().includes(search)) {
        keepIds.add(item.id);

        let currentParentId = item.parentId;
        while (currentParentId !== null && currentParentId !== undefined) {
          keepIds.add(currentParentId);
          const parentRow = data.find((p) => p.id === currentParentId);
          currentParentId = parentRow ? parentRow.parentId : null;
        }
      }
    });

    return data.filter((item) => keepIds.has(item.id));
  }, [data, searchQuery]);

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
    if (searchQuery.trim() !== "") return false;

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

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ================= BAR INPUT PENCARIAN NAMA BERKAS ================= */}
      <div className="relative w-full max-w-md">
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
      </div>

      {/* ================= TABEL TREE GRID ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead className="bg-slate-100/70 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`px-6 py-3.5 border-b border-slate-200 ${col.className ?? ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white">
              {orderedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-slate-400 bg-slate-50/50 border-b border-slate-300"
                  >
                    Dokumen atau berkas tidak ditemukan
                  </td>
                </tr>
              ) : (
                orderedData.map((row) => {
                  if (checkIfRowHidden(row)) return null;
                  const isCollapsed = collapsedIds.has(row.id);
                  const dynamicLevel = calculateRowLevel(row);

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      {columns.map((col, idx) => {
                        const bodyBorderClasses = `border-b border-slate-300 ${
                          idx < columns.length - 1
                            ? "border-r border-slate-300"
                            : ""
                        }`;

                        if (col.render) {
                          return (
                            <td
                              key={String(col.key)}
                              className={`px-6 py-3.5 ${bodyBorderClasses} ${col.className ?? ""}`}
                            >
                              {col.render(row)}
                            </td>
                          );
                        }

                        if (col.isTreeField) {
                          return (
                            <td
                              key={String(col.key)}
                              className={`px-6 py-3.5 font-medium text-slate-800 ${bodyBorderClasses} ${col.className ?? ""}`}
                            >
                              <div
                                className="flex items-center gap-1"
                                style={{
                                  paddingLeft: `${dynamicLevel * 1.5}rem`,
                                }}
                              >
                                {!row.isLeaf ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(row.id)}
                                    className="p-1 rounded hover:bg-slate-200/60 text-slate-500 transition-colors duration-150 flex items-center justify-center"
                                    aria-label={
                                      isCollapsed
                                        ? "Buka folder"
                                        : "Tutup folder"
                                    }
                                  >
                                    <ChevronTriangleIcon
                                      className={`w-3.5 h-3.5 transform transition-transform duration-200 ease-in-out
                                        ${isCollapsed ? "-rotate-90 text-slate-400" : "rotate-0 text-slate-600"}`}
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

                        return (
                          <td
                            key={String(col.key)}
                            className={`px-6 py-3.5 text-slate-600 ${bodyBorderClasses} ${col.className ?? ""}`}
                          >
                            {row[col.key as string] ?? "-"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
