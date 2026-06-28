"use client";

import React, { useState, useEffect } from "react";

export interface ColumnProps<T> {
  key: keyof T | "actions";
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataGridProps<T> {
  data: T[]; // Data yang masuk ke sini HARUS sudah difilter oleh halaman luar
  columns: ColumnProps<T>[];
  totalEntriesBeforeFilter?: number; // Opsional: Untuk angka total catatan awal
}

export default function DataGrid<T extends { id: string }>({
  data,
  columns,
  totalEntriesBeforeFilter,
}: Readonly<DataGridProps<T>>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // LOGIKA PAGINATION INTERNAL
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPaginatedData = data.slice(indexOfFirstRow, indexOfLastRow);

  // Auto-reset halaman ke 1 jika jumlah data berubah (akibat filter luar berganti)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, rowsPerPage]);

  return (
    <div className="space-y-4 w-full">
      {/* TABLE GRID CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={`p-4 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentPaginatedData.length > 0 ? (
                currentPaginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                    {columns.map((col, idx) => (
                      <td key={idx} className={`p-4 ${col.className || ""}`}>
                        {col.render 
                          ? col.render(row) 
                          : (row[col.key as keyof T] as React.ReactNode)
                        }
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center text-slate-400 font-normal">
                    ⚠️ Tidak ada data yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* GRID FOOTER / PAGINATION */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-slate-600 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto text-center sm:text-left">
            <div>
              Menampilkan{" "}
              <span className="text-slate-900 font-bold">
                {data.length === 0 ? 0 : indexOfFirstRow + 1}
              </span>{" "}
              sampai{" "}
              <span className="text-slate-900 font-bold">
                {Math.min(indexOfLastRow, data.length)}
              </span>{" "}
              dari <span className="text-slate-900 font-bold">{data.length}</span> entri disaring{" "}
              {totalEntriesBeforeFilter !== undefined && (
                <span className="text-slate-400 text-[11px]">(Total: {totalEntriesBeforeFilter})</span>
              )}
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="text-slate-400 text-[11px]">Tampilkan:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer text-[11px] shadow-sm"
              >
                <option value={2}>2</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          {/* Navigasi Halaman Sederhana */}
          {totalPages > 1 && (
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-50 text-slate-700"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-50 text-slate-700"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
