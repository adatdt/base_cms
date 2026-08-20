"use client";

import React from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { userEditFormSchema } from "../schema/users.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/shared/FormFieldRenderer";

const input: InputSchema[] = [
    {
        name: "username",
        label: "USERNAME",
        variant: "text",
        placeholder: "Masukkan username",
        required: true, // Menandai field ini sebagai wajib diisi
    },
    {
        name: "group",
        label: "GROUP",
        variant: "select",
        required: true,
        placeholder: "Pilih group...",
        selectBy: "label", // Menentukan seleksi berdasarkan id (mengikuti setup dinamis kita sebelumnya)
    },
    {
        name: "nama_depan",
        label: "NAMA DEPAN",
        variant: "text",
        placeholder: "Masukkan nama ",
        required: true,
    },
    {
        name: "no_telepon",
        label: "NO. TELEPON",
        variant: "text",
        placeholder: "Masukkan no. telepon",
        required: true,
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
    const { masterOptions, isMasterLoading } = useFormStore();

    const sendForm = (e: React.SubmitEvent<HTMLFormElement>) => {
        executeSubmit(e, {
            formKey: "menuForm",
            schema: userEditFormSchema,
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
