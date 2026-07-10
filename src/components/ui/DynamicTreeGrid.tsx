"use client";

import React, { useState, useCallback } from "react";
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

// SOLUSI SONARQUBE: Menghapus modifikator Readonly dari parameter fungsi komponen utama
export default function DynamicTreeGrid<T extends TreeGridRow>({
  columns,
  data,
}: Readonly<TreeGridProps<T>>) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string | number>>(
    new Set(),
  );

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
    let currentParentId = row.parentId;
    while (currentParentId !== null) {
      if (collapsedIds.has(currentParentId)) return true;
      const parentRow = data.find((item) => item.id === currentParentId);
      currentParentId = parentRow ? parentRow.parentId : null;
    }
    return false;
  };

  return (
    /* Pembungkus 1: Mengunci bentuk lengkungan sudut luar baru rounded-2xl dan shadow tipis */
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
      {/* Pembungkus 2: Menangani mekanisme scrollbar horizontal jika kolom sangat panjang */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left border-collapse">
          {/* UBAH VISUAL HEADER: Mengubah bg-slate-50 menjadi bg-slate-100/70 agar tidak terlalu silau/terang */}
          <thead className="bg-slate-100/70 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-3.5 ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row) => {
              if (checkIfRowHidden(row)) return null;
              const isCollapsed = collapsedIds.has(row.id);

              return (
                <tr
                  key={row.id}
                  /* UBAH VISUAL HOVER: Mengubah hover:bg-slate-50/70 menjadi hover:bg-slate-50/40 agar redup transparan */
                  className="hover:bg-slate-50/40 transition-colors"
                >
                  {columns.map((col) => {
                    // 1. Kolom Kustom Render (Aksi dari Page)
                    if (col.render) {
                      return (
                        <td
                          key={String(col.key)}
                          className={`px-6 py-3.5 ${col.className ?? ""}`}
                        >
                          {col.render(row)}
                        </td>
                      );
                    }

                    // 2. Kolom Utama Penunjuk Hirarki (Tree Field)
                    if (col.isTreeField) {
                      return (
                        <td
                          key={String(col.key)}
                          className={`px-6 py-3.5 font-medium text-slate-800 ${col.className ?? ""}`}
                        >
                          <div
                            className="flex items-center gap-1"
                            style={{ paddingLeft: `${row.level * 1.5}rem` }}
                          >
                            {!row.isLeaf ? (
                              <button
                                type="button"
                                onClick={() => handleToggle(row.id)}
                                className="p-1 rounded hover:bg-slate-200/60 text-slate-500 transition-colors duration-150 flex items-center justify-center"
                                aria-label={
                                  isCollapsed ? "Buka folder" : "Tutup folder"
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

                    // 3. Default: Render teks biasa
                    return (
                      <td
                        key={String(col.key)}
                        className={`px-6 py-3.5 text-slate-600 ${col.className ?? ""}`}
                      >
                        {row[col.key as string] ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
