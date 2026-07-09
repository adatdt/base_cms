"use client";

import React, { useState } from "react";

interface UserFormFieldsProps {
  formId: string; // Harus sama dengan ID Modal agar terhubung dengan tombol Simpan
  onSubmit: (data: any) => void;
}

export default function Add({
  formId,
  onSubmit,
}: Readonly<UserFormFieldsProps>) {
  const [formData, setFormData] = useState({
    username: "",
    namaDepan: "",
    noTelepon: "",
    group: "",
    status: "1", // 1 = Aktif, 2 = Non Aktif
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitInside = (
    e: React.BaseSyntheticEvent<Event, EventTarget, HTMLFormElement>,
  ) => {
    e.preventDefault(); // Mencegah reload halaman browser
    onSubmit(formData); // Teruskan data ke halaman utama
  };

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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm dark:bg-gray-700 dark:text-white cursor-pointer"
        >
          <option value="1">Aktif</option>
          <option value="2">Non Aktif</option>
        </select>
      </div>
    </form>
  );
}
