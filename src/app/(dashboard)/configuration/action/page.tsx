"use client";

import React, { useState, useEffect, useCallback } from "react";
import DataGrid, { ColumnProps } from "@/components/ui/DataGrid";
import Button from "@/components/ui/Btn";
import type { TableAction } from "./interfaces/action";
import CrudIcons from "@/components/ui/CrudIcons";
import Btn from "@/components/ui/Btn";
import Modal from "@/components/ui/Modal";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";


const moduleName = "List Aksi";

export default function ActionPage() {

  const [tableData, setTableData] = useState<TableAction[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [typedQuery, setTypedQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { toast, triggerNotification, handleClose } = useNotification();

  const fetchData = useCallback(
    async (targetPage: number, targetLimit: number, searchQuery: string) => {
      try {
        const response = await fetch(
          "/configuration/action/api/get_data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              page: targetPage,
              limit: targetLimit,
              search: searchQuery.trim(),
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil data (HTTP ${response.status})`,
          );
        }

        const result = await response.json();

        if (result.success) {
          const data: TableAction[] = (result.data || []).map(
            (item: TableAction, index: number) => ({
              ...item,
              no: (targetPage - 1) * targetLimit + index + 1,
            }),
          );

          setTableData(data);
          setTotalRecords(result.total_data || 0);
        }
      } catch (err: any) {
        console.error(err);
        triggerNotification(
          "Terjadi kesalahan sistem.",
          "error",
        );
      }
    },
    [triggerNotification],
  );

  useEffect(() => {
    fetchData(page, limit, typedQuery);
  }, [page, limit, fetchData]);

  const handleRefresh = () => {
    setPage(1);
    fetchData(1, limit, typedQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRefresh();
    }
  };

  const handleCloseForm = () => {
    setInputValue("");
    setIsFormModalOpen(false);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const response = await fetch(
        "/configuration/action/api/insert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action_name: inputValue.trim(),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menyimpan data.",
        );
      }

      triggerNotification(
        "Data berhasil ditambahkan.",
        "success",
      );

      handleCloseForm();

      fetchData(page, limit, typedQuery);
    } catch (err: any) {
      triggerNotification(
        err.message || "Gagal menyimpan data.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnProps<TableAction>[] = [
    {
      key: "no",
      header: "NO",
      className: "w-16 text-center text-slate-500",
      headerClassName: "text-center",
    },
    {
      key: "action_name",
      header: "List Aksi",
      className: "font-semibold text-slate-700",
      headerClassName: "text-center",
    },
    {
      key: "actions",
      header: "AKSI",
      className: "w-25",
      headerClassName: "text-center",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Btn
            type="button"
            variant="info"
            size="xs"
            title="Edit"
            onClick={() => setIsFormModalOpen(true)}
          >
            <CrudIcons name="edit" size={10} />
          </Btn>

          <Btn
            type="button"
            variant="delete"
            size="xs"
            title="Delete"
            onClick={() => setIsModalOpen(true)}
          >
            <CrudIcons name="delete" size={10} />
          </Btn>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 w-full space-y-6 text-slate-800 min-h-screen bg-slate-50/50">

      {/* Notification */}
      {toast.message && (
        <Notification
          message={toast.message}
          type={toast.type}
          onClose={handleClose}
        />
      )}

      {/* Modal Delete */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Konfirmasi Hapus Data"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus data ini?
          </p>

          <div className="flex justify-end gap-2">
            <Btn
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Btn>

            <Btn
              type="button"
              variant="delete"
              onClick={() => {
                setIsModalOpen(false);

                triggerNotification(
                  "Fitur hapus masih dalam proses.",
                  "info",
                );
              }}
            >
              Hapus
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Modal Form */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        title="Tambah Aksi"
        onConfirm={() => {
            const form = document.getElementById(
                "form-action",
            ) as HTMLFormElement | null;

            form?.requestSubmit();
        }}
        confirmText="Simpan"
        confirmLoading={isSaving}
      >
        <form
          id="form-action"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Aksi
            </label>

            <input
              type="text"
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value)
              }
              placeholder="Masukkan nama aksi"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              autoFocus
              required
            />
          </div>
        </form>
      </Modal>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {moduleName}
          </h1>

          <p className="text-sm text-slate-400">
            Master data menu List Aksi.
          </p>
        </div>

        <Btn
          type="button"
          variant="primary"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            setInputValue("");
            setIsFormModalOpen(true);
          }}
        >
          <CrudIcons name="add" size={15} />
          Tambah
        </Btn>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex flex-1 items-center gap-2 max-w-md w-full">

          <div className="flex flex-1 items-center isolate">

            <span className="flex items-center justify-center bg-slate-100 border border-slate-200 rounded-l-lg h-8.5 px-3.5 text-xs font-medium text-slate-500">
              Cari
            </span>

            <input
              type="text"
              placeholder="Cari Action..."
              value={typedQuery}
              onChange={(e) =>
                setTypedQuery(e.target.value)
              }
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-50 border border-slate-200 rounded-r-lg h-8.5 px-3 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <Button
            variant="delete"
            size="sm"
            onClick={handleRefresh}
            className="min-w-18"
          >
            Cari
          </Button>

        </div>
      </div>

      {/* Table */}
      <DataGrid
        data={tableData}
        columns={columns}
        currentPage={page}
        rowsPerPage={limit}
        totalData={totalRecords}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
}