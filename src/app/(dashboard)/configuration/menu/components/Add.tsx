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
        variant: "select-multiple",
        placeholder: "Masukkan aksi",
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
        variant: "select-hierarchy",
        placeholder: "Masukkan parent",
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
    const { masterOptions, isMasterLoading } = useFormStore();

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
                        if (isMasterLoading) {
                            return (
                                <div className="w-full h-10 bg-slate-100 animate-pulse rounded-lg" />
                            );
                        }
                        const dynamicOptions =
                            masterOptions[item.name] || item.options || [];
                        if (item.variant === "select") {
                            return (
                                <SelectData
                                    name={item.name}
                                    hasError={!!errors[item.name]} // Menentukan apakah ada error untuk field ini
                                    defaultValue=""
                                    onChange={handleFieldChange(item.name)}
                                    options={dynamicOptions || []}
                                />
                            );
                        }

                        if (item.variant === "select-hierarchy") {
                            return (
                                <SelectHierarchyData
                                    name={item.name}
                                    options={dynamicOptions}
                                    value={formData[item.name]}
                                    onChange={handleFieldChange(item.name)}
                                    hasError={!!errors.parent}
                                    placeholder="Pilih Parent Menu..."
                                />
                            );
                        }

                        if (item.variant === "select-multiple") {
                            const rawData = formData[item.name];
                            let currentValue: (string | number)[] = [];

                            // Lakukan parse aman agar komponen select-multiple bisa membaca array asli
                            if (
                                typeof rawData === "string" &&
                                rawData.trim() !== ""
                            ) {
                                try {
                                    const parsed = JSON.parse(rawData);
                                    if (Array.isArray(parsed))
                                        currentValue = parsed;
                                } catch (e) {
                                    console.log(e);
                                    currentValue = [];
                                }
                            } else if (Array.isArray(rawData)) {
                                currentValue = rawData;
                            }
                            return (
                                <SelectDataMultiple
                                    name={item.name}
                                    options={dynamicOptions}
                                    placeholder="Pilih beberapa hak akses..."
                                    hasError={!!errors["roles"]}
                                    value={currentValue}
                                    onChange={(selectedArray) => {
                                        // Jika handleFieldChange Anda hanya menerima string/number, konversi array menjadi JSON string agar aman
                                        const valueToSave =
                                            JSON.stringify(selectedArray);
                                        handleFieldChange(item.name)(
                                            valueToSave,
                                        );
                                    }}
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
        </form>
    );
}
