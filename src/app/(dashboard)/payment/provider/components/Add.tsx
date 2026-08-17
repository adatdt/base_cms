"use client";

import React, { useEffect } from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { providerAddFormSchema } from "../schema/provider.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/ui/FormFieldRenderer";
import { useShallow } from "zustand/shallow";

const input: InputSchema[] = [
    {
        name: "bussines_category",
        label: "Nama Kategori Bisnis",
        variant: "text",
        placeholder: "Masukkan nama parameter",
        required: true,
    },
    {
        name: "file_provider",
        label: "Gambar Provider",
        variant: "input-file",
        placeholder: "Masukkan nama parameter",
        description:
            "  Upload gambarProvidet disini dengan maksimal size sebesar 3.88MB (.PNG, .JPG, dan .SVG)",
        required: true,
    },
    {
        name: "non_snap",
        label: "Base URL Non-SNAP",
        variant: "text",
        placeholder: "Masukkan base URL Non-SNAP provider ",
        required: true,
    },
    {
        name: "snap",
        label: "Base URL SNAP",
        variant: "text",
        placeholder: "Masukkan base URL SNAP provider ",
        required: true,
    },
    {
        name: "timeout_read",
        label: "Config Timeout Read",
        variant: "text-addon",
        placeholder: "Masukkan timeout read dalam detik ",
        required: true,
        addOnRight:"Detik"
    },
    {
        name: "timeout_white",
        label: "Config Timeout Write",
        variant: "text-addon",
        placeholder: "Masukkan timeout write dalam detik",
        required: true,
        addOnRight:"Detik"
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
        handleFileChange
    } = useFormStore(
        useShallow((state) => ({
            formData: state.formData,
            errors: state.errors,
            handleChange: state.handleChange,
            handleFieldChange: state.handleFieldChange,
            executeSubmit: state.executeSubmit,
            resetForm: (state as any).resetForm, // Deteksi otomatis fungsi reset di store
            handleFileChange: state.handleFileChange,
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
            formKey: "formAddProvider",
            schema: providerAddFormSchema,
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
             encType="multipart/form-data" 
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
                    handleFileChange={handleFileChange}
                />
            ))}
        </form>
    );
}
