"use client";

import { InputText } from "@/components/ui/InputText";
import { SelectData } from "@/components/ui/SelectData";
import React, { useState } from "react";

interface UserFormFieldsProps {
    formId: string; // Harus sama dengan ID Modal agar terhubung dengan tombol Simpan
    onSubmit: (data: any) => void;
}

interface SelectOption {
    value: string | number;
    label: string;
}

interface InputSchema {
    name: string;
    variant: string;
    label: string;
    placeholder: string;
    options?: SelectOption[]; // ⚠️ Menggunakan tanda ? berarti boleh ada atau undefined
}
const input: InputSchema[] = [
    {
        name: "menu",
        label: "Menu",
        variant: "text",
        placeholder: "Masukkan menu",
    },
    {
        name: "action",
        label: "Aksi",
        variant: "select",
        placeholder: "Masukkan aksi",
        options: [
            { value: "0", label: "Tidak Ada (Jadikan Menu Utama)" },
            { value: "1", label: "Dashboard Utama" },
            { value: "2", label: "Pengaturan Sistem" },
            { value: "3", label: "Manajemen Pengguna" },
            { value: "4", label: "Hak Akses & Otentikasi" },
            { value: "5", label: "Profil Perusahaan" },
            { value: "6", label: "Manajemen Departemen" },
            { value: "7", label: "Daftar Karyawan" },
            { value: "8", label: "Absensi & Kehadiran" },
            { value: "9", label: "Pengajuan Cuti Karyawan" },
            { value: "10", label: "Sistem Penggajian (Payroll)" },
        ],
    },
    {
        name: "icon",
        label: "Ikon",
        variant: "text",
        placeholder: "Masukkan icon",
    },
    {
        name: "order",
        label: "Urutan",
        variant: "text",
        placeholder: "Masukkan order",
    },
    {
        name: "parent",
        label: "Parent",
        variant: "text",
        placeholder: "Masukkan parent",
    },
    {
        name: "url",
        label: "URL",
        variant: "text",
        placeholder: "Masukkan url",
    },
];

export default function Edit({
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
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-left"
        >
            {input.map((item) => (
                <div key={item.name} className="flex flex-col gap-1.5">
                    <label
                        htmlFor={item.name}
                        className="text-xs font-semibold text-gray-700 "
                    >
                        {item.label}
                    </label>
                    {(() => {
                        // Jika variant berupa "select", render komponen SelectData
                        if (item.variant === "select") {
                            return (
                                <SelectData
                                    name={item.name}
                                    defaultValue=""
                                    options={item.options || []}
                                    required
                                />
                            );
                        }

                        return (
                            <InputText
                                type={item.variant} // Otomatis menjadi 'text' atau 'number'
                                name={item.name}
                                placeholder={item.placeholder}
                                required
                            />
                        );
                    })()}
                </div>
            ))}
            {/* Field Username */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="usernameInput"
                    className="text-xs font-semibold text-gray-700 "
                >
                    Username
                </label>
                <InputText
                    type="text"
                    id="usernameInput"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    required
                />
            </div>
        </form>
    );
}
