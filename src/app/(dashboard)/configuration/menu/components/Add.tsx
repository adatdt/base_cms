"use client";

import { InputText } from "@/components/ui/InputText";
import { SelectData } from "@/components/ui/SelectData";
import React from "react";
import type { InputSchema } from "../interfaces/menu.interfaces";
import { menuFormSchema } from "../schema/menu.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { SelectHierarchyData } from "@/components/ui/SelectHierarchyData";
import { useFormStore } from "@/store/useFormStore";
import { SelectDataMultiple } from "@/components/ui/SelectDataMultiple";

interface UserFormFieldsProps {
    formId: string; // Harus sama dengan ID Modal agar terhubung dengan tombol Simpan
}

const roleOptions = [
    { value: "1", label: "Super Admin" },
    { value: "2", label: "Management" },
    { value: "3", label: "Staff Operational" },
    { value: "4", label: "Viewer Only" },
    { value: "5", label: "Human Resources Manager" },
    { value: "6", label: "HR Specialist" },
    { value: "7", label: "Finance Director" },
    { value: "8", label: "Finance & Accounting Staff" },
    { value: "9", label: "Project Manager" },
    { value: "10", label: "Lead Developer" },
    { value: "11", label: "Senior Developer" },
    { value: "12", label: "Junior Developer" },
    { value: "13", label: "Quality Assurance Specialist" },
    { value: "14", label: "System Administrator" },
    { value: "15", label: "Network Engineer" },
    { value: "16", label: "Data Analyst" },
    { value: "17", label: "Marketing Manager" },
    { value: "18", label: "Marketing Content Creator" },
    { value: "19", label: "Customer Relation Officer" },
    { value: "20", label: "Internal Auditor" },
];

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
        variant: "select-hirarchy",
        placeholder: "Masukkan parent",
        options: [
            { value: "1", label: "Dashboard Utama", parent: null },
            { value: "2", label: "Pengaturan Sistem", parent: null },
            { value: "3", label: "Manajemen Pengguna", parent: "2" }, // ↳ Child dari Pengaturan Sistem
            { value: "4", label: "Hak Akses & Role", parent: "3" }, //   ↳ Child dari Manajemen Pengguna (Cucu)
            { value: "5", label: "Profil Perusahaan", parent: null },
            { value: "6", label: "Daftar Karyawan", parent: "5" },
        ],
    },
    {
        name: "url",
        label: "URL",
        variant: "text",
        placeholder: "Masukkan url",
    },
];

export default function Add({ formId }: Readonly<UserFormFieldsProps>) {
    // State untuk menyimpan pesan error dari Zod
    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );

    const formData = useFormStore((state) => state.formData);
    const errors = useFormStore((state) => state.errors);
    const handleChange = useFormStore((state) => state.handleChange);
    const handleFieldChange = useFormStore((state) => state.handleFieldChange);

    const executeSubmit = useFormStore((state) => state.executeSubmit);

    const sendForm = (e: React.SubmitEvent<HTMLFormElement>) => {
        executeSubmit(e, {
            formKey: "menuForm",
            schema: menuFormSchema,
            endpoint: "/configuration/menu/api/crud",
            method: "POST",
            triggerNotification: triggerNotification,
            onSuccess: (response) => {
                console.log("Data berhasil dikirim!", response);
            },
            onError: () => {
                // Remove the unused parameter placeholder entirely
                console.log("API error handled cleanly in UI.");
            },
        }).catch(() => {
            // Safe parameterless empty catcher
            console.log("Safely caught unhandled form execution rejection.");
        });
    };

    const getSelectedRoles = (): (string | number)[] => {
        const rawValue = formData["roles"];

        if (!rawValue) return [];

        // 💡 JIKA DI ZUSTAND BENTUKNYA STRING JSON (Hasil dari JSON.stringify di fetchFormDetails lama)
        try {
            const parsed = JSON.parse(rawValue);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            // 💡 JIKA DI ZUSTAND BENTUKNYA STRING BIASA TERPISAH KOMA (Contoh: "1,2,3")
            return rawValue.split(",").map((item) => item.trim());
        }
    };

    return (
        <form
            id={formId}
            onSubmit={sendForm}
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
                                    hasError={!!errors[item.name]} // Menentukan apakah ada error untuk field ini
                                    defaultValue=""
                                    onChange={handleFieldChange(item.name)}
                                    options={item.options || []}
                                />
                            );
                        }

                        if (item.variant === "select-hirarchy") {
                            return (
                                <SelectHierarchyData
                                    name={item.name}
                                    options={item.options || []}
                                    value={formData.parent}
                                    onChange={handleFieldChange(item.name)}
                                    hasError={!!errors.parent}
                                    placeholder="Pilih Parent Menu..."
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
                                hasError={!!errors[item.name]}
                                name={item.name}
                                placeholder={item.placeholder}
                                required
                            />
                        );
                    })()}
                    <p className="mt-1 text-sm text-red-600 font-medium">
                        {errors[item.name] || ""}
                    </p>
                </div>
            ))}

            <SelectDataMultiple
                name="roles"
                options={roleOptions}
                placeholder="Pilih beberapa hak akses..."
                hasError={!!errors["roles"]}
                // 💡 Kirimkan nilai berbentuk array murni
                value={getSelectedRoles()}
                // 💡 Ambil array baru [ "1", "3" ] yang dipilih user, lalu simpan ke Zustand
                onChange={(selectedArray) => {
                    // Jika handleFieldChange Anda hanya menerima string/number, konversi array menjadi JSON string agar aman
                    const valueToSave = JSON.stringify(selectedArray);
                    handleFieldChange("roles")(valueToSave);
                }}
            />
        </form>
    );
}
