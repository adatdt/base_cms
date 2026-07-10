"use client";

import React, { useMemo, useCallback } from "react";
import DynamicTreeGrid from "@/components/ui/DynamicTreeGrid";
import Btn from "@/components/ui/Btn";
import CrudIcons from "@/components/ui/CrudIcons";
import type { TreeGridColumn } from "@/interfaces/treeGrid";

interface DocumentData {
  id: number;
  parentId: number | null;
  level: number;
  isLeaf: boolean;
  namaDokumen: string;
  owner: string;
}

export default function MenuPage() {
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
        key: "namaDokumen",
        header: "Nama Berkas / Folder",
        className: "w-1/2",
        isTreeField: true,
      },
      {
        key: "owner",
        header: "Pemilik",
      },
      {
        key: "actions",
        header: "AKSI",
        className: "text-center whitespace-nowrap",
        // MENARUH KONTEN TOMBOL AKSI LANGSUNG DI FILE PAGE:
        render: (row) => (
          <div className="flex justify-center gap-1.5">
            <Btn
              type="button"
              variant="info"
              size="xs"
              title="Edit"
              onClick={() => handleEdit(row)}
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

  const mockData: DocumentData[] = useMemo(
    () => [
      // ================= LEVEL 0: ROOT FOLDER 1 =================
      {
        id: 1,
        parentId: null,
        level: 0,
        isLeaf: false,
        namaDokumen: "01. Rencana Anggaran Perusahaan 2026",
        owner: "Finance Directors",
      },
      // LEVEL 1: Sub-Folder di bawah ID 1
      {
        id: 2,
        parentId: 1,
        level: 1,
        isLeaf: false,
        namaDokumen: "Departemen IT",
        owner: "IT Procurement",
      },
      // LEVEL 2: Sub-Folder di bawah ID 2
      {
        id: 3,
        parentId: 2,
        level: 2,
        isLeaf: false,
        namaDokumen: "Infrastruktur & Cloud",
        owner: "DevOps Team",
      },
      // LEVEL 3: Files di bawah ID 3
      {
        id: 4,
        parentId: 3,
        level: 3,
        isLeaf: true,
        namaDokumen: "estimasi_biaya_aws_it.xlsx",
        owner: "Andi (DevOps)",
      },
      {
        id: 5,
        parentId: 3,
        level: 3,
        isLeaf: true,
        namaDokumen: "kontrak_server_rack_space.pdf",
        owner: "Budi (SysAdmin)",
      },
      // LEVEL 2: File di bawah ID 2 (Sejajar dengan Folder ID 3)
      {
        id: 6,
        parentId: 2,
        level: 2,
        isLeaf: true,
        namaDokumen: "lisensi_software_enterprise.csv",
        owner: "Andi (DevOps)",
      },
      // LEVEL 1: Sub-Folder di bawah ID 1 (Sejajar dengan Folder ID 2)
      {
        id: 7,
        parentId: 1,
        level: 1,
        isLeaf: false,
        namaDokumen: "Departemen Pemasaran & HR",
        owner: "Marketing Lead",
      },
      // LEVEL 2: Files di bawah ID 7
      {
        id: 8,
        parentId: 7,
        level: 2,
        isLeaf: true,
        namaDokumen: "anggaran_iklan_q1_q2.pdf",
        owner: "Siti (Marketing)",
      },
      {
        id: 9,
        parentId: 7,
        level: 2,
        isLeaf: true,
        namaDokumen: "biaya_rekrutmen_karyawan.xlsx",
        owner: "Dewi (HRD)",
      },

      // ================= LEVEL 0: ROOT FOLDER 2 =================
      {
        id: 10,
        parentId: null,
        level: 0,
        isLeaf: false,
        namaDokumen: "02. Standar Operasional Prosedur (SOP)",
        owner: "Compliance QM",
      },
      // LEVEL 1: Sub-Folder di bawah ID 10
      {
        id: 11,
        parentId: 10,
        level: 1,
        isLeaf: false,
        namaDokumen: "Kebijakan Keamanan Informasi",
        owner: "CISO Office",
      },
      // LEVEL 2: File di bawah ID 11
      {
        id: 12,
        parentId: 11,
        level: 2,
        isLeaf: true,
        namaDokumen: "SOP_penanganan_insiden_cyber.pdf",
        owner: "SecOps Team",
      },
      // LEVEL 1: File di bawah ID 10 (Sejajar dengan Folder ID 11)
      {
        id: 13,
        parentId: 10,
        level: 1,
        isLeaf: true,
        namaDokumen: "panduan_ onboarding_karyawan_baru.pdf",
        owner: "Dewi (HRD)",
      },

      // ================= LEVEL 0: ROOT FILE STANDALONE =================
      {
        id: 14,
        parentId: null,
        level: 0,
        isLeaf: true,
        namaDokumen: "catatan_rapat_direksi_januari.docx",
        owner: "Corporate Secretary",
      },
    ],
    [],
  );

  return (
    <div className="p-8">
      <DynamicTreeGrid columns={columns} data={mockData} />
    </div>
  );
}
