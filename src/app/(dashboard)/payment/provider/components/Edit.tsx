"use client";

import React, { useEffect, useRef } from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { providerEditFormSchema } from "../schema/provider.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/shared/FormFieldRenderer";
import { useShallow } from "zustand/shallow";
import { useModalStore } from "@/store/useModalStore";

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
        addOnRight: "Detik",
    },
    {
        name: "timeout_white",
        label: "Config Timeout Write",
        variant: "text-addon",
        placeholder: "Masukkan timeout write dalam detik",
        required: true,
        addOnRight: "Detik",
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
        handleFileChange,
    } = useFormStore(
        useShallow((state) => ({
            formData: state.formData,
            errors: state.errors,
            handleChange: state.handleChange,
            handleFieldChange: state.handleFieldChange,
            executeSubmit: state.executeSubmit,
            handleFileChange: state.handleFileChange,
            resetForm: (state as any).resetForm,
        })),
    );
    const { masterOptions, isMasterLoading } = useFormStore();

    const activeModalId = useModalStore((state) => state.activeModalId);
    const isOpeningWithData = useModalStore((state) => state.isOpeningWithData);
    const openModalOnly = useModalStore((state) => state.openModalOnly);

    useEffect(() => {
        if (activeModalId === formId && isOpeningWithData && resetForm) {
            resetForm();
        }
    }, [activeModalId, isOpeningWithData, resetForm, formId]);

    const isConfirmedRef = useRef(false);
    const sendForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isConfirmedRef.current) {
            const isValid = (await executeSubmit(e, {
                schema: providerEditFormSchema,
                onlyValidate: true,
                formKey: formId,
                endpoint: "",
                triggerNotification: triggerNotification,
            })) as unknown as boolean;

            if (!isValid) return;
            console.log(formId);
            openModalOnly(`${formId}Action`);
            return;
        }

        executeSubmit(e, {
            formKey: formId,
            schema: providerEditFormSchema,
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
                    handleFileChange={handleFileChange}
                    handleFieldChange={handleFieldChange}
                />
            ))}
        </form>
    );
}
