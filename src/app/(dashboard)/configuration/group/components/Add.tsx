"use client";

import React, { useEffect, useRef } from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { groupAddFormSchema } from "../schema/group.schema";
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
        label: "Deskripsi Grup",
        variant: "text-area",
        placeholder: "Masukkan deskripsi ",
        required: true,
    },
];

export default function Add({ formId }: Readonly<UserFormFieldsProps>) {
    // State untuk menyimpan pesan error dari Zod
    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );

    const {
        executeSubmit,
        masterOptions,
        isMasterLoading,
        formData,
        errors,
        handleChange,
        handleFieldChange,
        resetForm,
    } = useFormStore(
        useShallow((state) => ({
            executeSubmit: state.executeSubmit,
            masterOptions: state.masterOptions,
            isMasterLoading: state.isMasterLoading,
            formData: state.formData,
            errors: state.errors,
            handleChange: state.handleChange,
            handleFieldChange: state.handleFieldChange,
            resetForm: (state as any).resetForm, // Mempertahankan assertion 'as any' bawaan Anda
        })),
    );

    const { isOpeningWithData, activeModalId, openModalOnly } = useModalStore(
        useShallow((state) => ({
            isOpeningWithData: state.isOpeningWithData,
            activeModalId: state.activeModalId,
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
                schema: groupAddFormSchema,
                onlyValidate: true,
                formKey: formId,
                endpoint: "",
                triggerNotification: triggerNotification,
            })) as unknown as boolean;
            console.log(isValid);
            if (!isValid) return;
            openModalOnly(`${formId}Action`);
            return;
        }

        executeSubmit(e, {
            formKey: formId,
            schema: groupAddFormSchema,
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
