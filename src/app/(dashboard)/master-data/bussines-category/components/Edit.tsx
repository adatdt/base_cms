"use client";

import React, { useEffect } from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { bussinesCategoryEditFormSchema } from "../schema/bussinesCategory.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/ui/FormFieldRenderer";
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

export default function Edit({ formId }: Readonly<UserFormFieldsProps>) {
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
            resetForm: (state as any).resetForm,
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
            schema: bussinesCategoryEditFormSchema,
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
