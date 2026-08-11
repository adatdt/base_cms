"use client";

import React from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { parameterAddFormSchema } from "../schema/parameter.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/ui/FormFieldRenderer";

const input: InputSchema[] = [
    {
        name: "param_name",
        label: "Nama Param",
        variant: "text",
        placeholder: "Masukkan Nama",
        required: true, // Menandai field ini sebagai wajib diisi
    },
    {
        name: "value_param",
        label: "Value Param",
        variant: "text",
        placeholder: "Masukkan Nama",
        required: true, // Menandai field ini sebagai wajib diisi
    },
    {
        name: "param_type",
        label: "Tipe Param",
        variant: "text",
        placeholder: "Masukkan Nama",
        required: true, // Menandai field ini sebagai wajib diisi
    },
    {
        name: "value_type",
        label: "Tipe Value",
        variant: "text",
        placeholder: "Masukkan Nama",
        required: true, // Menandai field ini sebagai wajib diisi
    },
    {
        name: "info",
        label: "Info",
        variant: "text",
        placeholder: "Masukkan Nama",
        required: true, // Menandai field ini sebagai wajib diisi
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
            schema: parameterAddFormSchema,
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
            className="grid grid-cols-1 gap-y-4 text-left w-full"
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
