"use client";

import React, { useState, useEffect } from "react";

// Definisikan tipe data objek pengguna yang akan diedit
export interface UserEditData {
  id?: string | number; // ID unik data dari database
  username: string;
  namaDepan: string;
  noTelepon: string;
  group: string;
  status: string; // "1" untuk Aktif, "2" untuk Non Aktif
}

interface UserFormEditFieldsProps {
  formId: string; // Harus sama dengan ID Modal agar tombol footer tersambung
  initialData: UserEditData | null; // Data lama yang dikirim untuk diedit
  onSubmit: (data: UserEditData) => void;
}

export default function Edit({
  formId,
  initialData,
  onSubmit,
}: Readonly<UserFormEditFieldsProps>) {
  // State lokal formulir
  const [formData, setFormData] = useState<UserEditData>({
    username: "",
    namaDepan: "",
    noTelepon: "",
    group: "",
    status: "1",
  });

  // Sinkronisasikan isi form setiap kali data lama (initialData) berubah/masuk
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitInside = (
    e: React.BaseSyntheticEvent<Event, EventTarget, HTMLFormElement>,
  ) => {
    e.preventDefault(); // Cegah halaman reload browser
    onSubmit(formData); // Kirim data yang sudah diubah ke level Page
  };

  // Tampilkan loading teks/kosong jika data lama belum selesai dimuat oleh parent
  if (!initialData) {
    return (
      <div className="text-center py-4 text-gray-500">
        Memuat data pengguna...
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmitInside}
      className="space-y-4 text-left"
    >
      {/* Field Username */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="usernameInput"
          className="text-xs font-semibold text-gray-700 dark:text-gray-300"
        >
          Username
        </label>
        <input
          type="text"
          id="usernameInput"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Masukkan username"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      {/* Field Nama Depan */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="namaDepanInput"
          className="text-xs font-semibold text-gray-700 dark:text-gray-300"
        >
          Nama Depan
        </label>
        <input
          type="text"
          id="namaDepanInput"
          name="namaDepan"
          value={formData.namaDepan}
          onChange={handleChange}
          placeholder="Masukkan nama depan"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      {/* Field No. Telepon */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="noTeleponInput"
          className="text-xs font-semibold text-gray-700 dark:text-gray-300"
        >
          No. Telepon
        </label>
        <input
          type="tel"
          id="noTeleponInput"
          name="noTelepon"
          value={formData.noTelepon}
          onChange={handleChange}
          placeholder="Contoh: 08123456789"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Field Group */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="groupInput"
          className="text-xs font-semibold text-gray-700 dark:text-gray-300"
        >
          Group
        </label>
        <input
          type="text"
          id="groupInput"
          name="group"
          value={formData.group}
          onChange={handleChange}
          placeholder="Masukkan nama group"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Field Status */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="statusInput"
          className="text-xs font-semibold text-gray-700 dark:text-gray-300"
        >
          Status
        </label>
        <select
          name="status"
          id="statusInput"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
        >
          <option value="1">Aktif</option>
          <option value="2">Non Aktif</option>
        </select>
      </div>
    </form>
  );
}
