"use client";

import { InputText } from "@/components/ui/InputText";
import { SelectData } from "@/components/ui/SelectData";
import React from "react";
import { useFormStore } from "@/store/useFormStore";
import type { InputSchema } from "../interfaces/menu.interfaces";
import { menuFormSchema } from "../schema/menu.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { SelectHierarchyData } from "@/components/ui/SelectHierarchyData";
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

export default function Edit({ formId }: Readonly<UserFormFieldsProps>) {
    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );

    const formData = useFormStore((state) => state.formData);
    const errors = useFormStore((state) => state.errors);
    const handleChange = useFormStore((state) => state.handleChange);
    const handleFieldChange = useFormStore((state) => state.handleFieldChange);

    const executeSubmit = useFormStore((state) => state.executeSubmit);
    const { masterOptions } = useFormStore();

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
                        const dynamicOptions =
                            masterOptions[item.name] || item.options || [];

                        if (item.variant === "select") {
                            return (
                                <SelectData
                                    name={item.name}
                                    hasError={!!errors[item.name]} // Menentukan apakah ada error untuk field ini
                                    value={formData[item.name] || ""}
                                    defaultValue=""
                                    onChange={handleFieldChange(item.name)}
                                    options={item.options || []}
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
                                    key={item.name}
                                    name={item.name}
                                    options={dynamicOptions}
                                    placeholder="Pilih beberapa hak akses..."
                                    hasError={!!errors[item.name]}
                                    value={currentValue}
                                    onChange={(selectedArray) => {
                                        handleFieldChange(item.name, {
                                            selectBy: "label", // Menyimpan teks label ("view", "edit") ke formData[item.name]
                                            options: dynamicOptions,
                                        })(selectedArray as any); // Gunakan 'as any' jika interface store lama Anda belum diubah tipe datanya
                                    }}
                                />
                            );
                        }

                        if (item.variant === "select-hierarchy") {
                            return (
                                <SelectHierarchyData
                                    name={item.name}
                                    options={dynamicOptions}
                                    value={formData[item.name] || ""}
                                    onChange={handleFieldChange(item.name, {
                                        selectBy: "label",
                                        options: dynamicOptions,
                                    })}
                                    hasError={!!errors.parent}
                                    placeholder="Pilih Parent Menu..."
                                />
                            );
                        }

                        return (
                            <InputText
                                type={item.variant} // Otomatis menjadi 'text' atau 'number'
                                value={formData[item.name] || ""}
                                onChange={handleChange}
                                hasError={!!errors[item.name]}
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
