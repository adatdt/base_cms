"use client";

import React, { useEffect } from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { paymentSchemaAddFormSchema } from "../schema/paymentSchema.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/shared/FormFieldRenderer";
import { useShallow } from "zustand/shallow";

const input: InputSchema[] = [
    {
        name: "payment_schema_name",
        label: "Nama Schema Payment",
        variant: "text",
        placeholder: "Masukkan nama parameter",
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
            schema: paymentSchemaAddFormSchema,
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
