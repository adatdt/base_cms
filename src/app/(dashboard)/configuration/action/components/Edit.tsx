"use client";

import React, { useEffect, useRef } from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { actionEditFormSchema } from "../schema/action.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/shared/FormFieldRenderer";
import { useModalStore } from "@/store/useModalStore";
import { useShallow } from "zustand/shallow";

const input: InputSchema[] = [
    {
        name: "name",
        label: "Nama",
        variant: "text",
        placeholder: "Masukkan Nama",
        required: true, // Menandai field ini sebagai wajib diisi
    },
    {
        name: "description",
        label: "Deskripsi Action",
        variant: "text-area", // Menggunakan komponen InputTextArea tanpa garis 3 resize-none yang kita set tadi
        placeholder: "Masukkan deskripsi action",
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
        masterOptions,
        isMasterLoading,
    } = useFormStore(
        useShallow((state) => ({
            formData: state.formData,
            errors: state.errors,
            handleChange: state.handleChange,
            handleFieldChange: state.handleFieldChange,
            executeSubmit: state.executeSubmit,
            resetForm: (state as any).resetForm, // Mempertahankan assertion bawaan Anda
            masterOptions: state.masterOptions,
            isMasterLoading: state.isMasterLoading,
        })),
    );

    const { activeModalId, isOpeningWithData, openModalOnly } = useModalStore(
        useShallow((state) => ({
            activeModalId: state.activeModalId,
            isOpeningWithData: state.isOpeningWithData,
            openModalOnly: state.openModalOnly,
        })),
    );

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
                schema: actionEditFormSchema,
                onlyValidate: true,
                formKey: formId,
                endpoint: "",
                triggerNotification: triggerNotification,
            })) as unknown as boolean;

            if (!isValid) return;
            openModalOnly(`${formId}Action`);
            return;
        }
        executeSubmit(e, {
            formKey: "menuForm",
            schema: actionEditFormSchema,
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
