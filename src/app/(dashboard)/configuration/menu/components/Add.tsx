"use client";

import React from "react";
import type { InputSchema } from "../interfaces/menu.interfaces";
import { menuFormSchema } from "../schema/menu.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/ui/FormFieldRenderer";

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
    },{
        name: "action",
        label: "Aksi",
        variant: "select-multiple",
        placeholder: "Masukkan aksi",
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
                    <FormFieldRenderer
                        key={item.name}
                        item={item}
                        isMasterLoading={isMasterLoading}
                        masterOptions={masterOptions}
                        errors={errors}
                        formData={formData}
                        handleChange={handleChange}
                        handleFieldChange={handleFieldChange}
                    />
                ))}
            </form>
        
    );
}
