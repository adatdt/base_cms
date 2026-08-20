"use client";

import React, { useEffect } from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { parameterAddFormSchema } from "../schema/parameter.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/shared/FormFieldRenderer";
import { useShallow } from "zustand/shallow";

const input: InputSchema[] = [
    {
        name: "param_name",
        label: "Nama Parameter",
        variant: "text",
        placeholder: "Masukkan nama parameter",
        required: true,
    },
    {
        name: "param_type",
        label: "Tipe Parameter",
        variant: "text", // Bisa diganti "select" jika berupa pilihan dropdown
        placeholder: "Masukkan tipe parameter",
        required: true,
    },
    {
        name: "param_value",
        label: "Value Parameter",
        variant: "text",
        placeholder: "Masukkan nilai parameter",
        required: true,
    },
    {
        name: "value_type",
        label: "Value Tipe",
        variant: "text", // Bisa diganti "select" jika ada pilihan tipe (string/number/boolean)
        placeholder: "Masukkan tipe nilai",
        required: true,
    },
    {
        name: "description",
        label: "Keterangan",
        variant: "text-area", // Menggunakan textarea karena biasanya deskripsi membutuhkan teks panjang
        placeholder: "Masukkan deskripsi penjelasan",
        required: true,
    },
];

export default function Add({ formId }: Readonly<UserFormFieldsProps>) {
    // State untuk menyimpan pesan error dari Zod
    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );

    const {
        formData,
        errors,
        handleChange,
        handleFieldChange,
        executeSubmit,
        resetForm,
    } = useFormStore(
        useShallow((state) => ({
            formData: state.formData,
            errors: state.errors,
            handleChange: state.handleChange,
            handleFieldChange: state.handleFieldChange,
            executeSubmit: state.executeSubmit,
            resetForm: (state as any).resetForm, // Deteksi otomatis fungsi reset di store
        })),
    );
    const { masterOptions, isMasterLoading } = useFormStore();
    useEffect(() => {
        if (resetForm) {
            resetForm();
        }
    }, [resetForm]);

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
