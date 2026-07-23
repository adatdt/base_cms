"use client";

import { InputText } from "@/components/ui/InputText";
import { SelectData } from "@/components/ui/SelectData";
import React, { useState } from "react";
import type { InputSchema } from "../interfaces/menu.interaces";
import { MenuFormData, menuFormSchema } from "../schema/menu.schema";
import { handleFormSubmit } from "@/utils/form-handler";

interface UserFormFieldsProps {
    formId: string; // Harus sama dengan ID Modal agar terhubung dengan tombol Simpan
    onSubmit: (data: any) => void;
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

const initialFormData = input.reduce(
    (acc, currentItem) => {
        acc[currentItem.name] = ""; // Semua key otomatis bernilai string kosong ""
        return acc;
    },
    {} as Record<string, string>,
);
export default function Add({
    formId,
    onSubmit,
}: Readonly<UserFormFieldsProps>) {
    const [formData, setFormData] =
        useState<Record<string, string>>(initialFormData);
    const [errors, setErrors] = useState<
        Partial<Record<keyof MenuFormData, string>>
    >({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name as keyof MenuFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // const handleSubmitInside = (
    //     e: React.BaseSyntheticEvent<Event, EventTarget, HTMLFormElement>,
    // ) => {
    //     e.preventDefault(); // Mencegah reload halaman browser
    //     onSubmit(formData); // Teruskan data ke halaman utama
    // };
    const handleSubmitInside = async (e: React.SubmitEvent) => {
        e.preventDefault();

        // Jalankan validasi Zod sebelum kirim data ke API
        const result = menuFormSchema.safeParse(formData);

        if (!result.success) {
            // Jika validasi gagal, ambil semua pesan errornya
            const formattedErrors: any = {};
            result.error.issues.forEach((err) => {
                if (err.path[0]) {
                    formattedErrors[err.path[0]] = err.message;
                }
            });
            setErrors(formattedErrors);
            return; // Hentikan proses submit ke API
        }

        // Jika lolos validasi, kirim data yang sudah valid (result.data) ke API
        try {
            await handleFormSubmit<MenuFormData, any>(
                "/api/v1/menu",
                result.data,
                "POST",
                {
                    onSuccess: () => alert("Data berhasil dikirim!"),
                    onError: (err) => alert("Gagal mengirim data ke server"),
                },
            );
        } catch (err) {
            console.error(err);
        }
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
                                value={
                                    formData[
                                        item.name as keyof typeof formData
                                    ] || ""
                                }
                                onChange={handleChange}
                                name={item.name}
                                placeholder={item.placeholder}
                                required
                            />
                        );
                    })()}
                </div>
            ))}
        </form>
    );
}
