"use client";

import React, { useEffect, useRef } from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { actionAddFormSchema } from "../schema/action.schema";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useFormStore } from "@/store/useFormStore";
import { FormFieldRenderer } from "@/components/shared/FormFieldRenderer";
import { useShallow } from "zustand/shallow";
import { useModalStore } from "@/store/useModalStore";

const input: InputSchema[] = [
    {
        name: "name",
        label: "Nama Action",
        variant: "text",
        placeholder: "Masukkan nama action",
        required: true,
    },
    {
        name: "description",
        label: "Deskripsi Action",
        variant: "text-area", // Menggunakan komponen InputTextArea tanpa garis 3 resize-none yang kita set tadi
        placeholder: "Masukkan deskripsi action",
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
                schema: actionAddFormSchema,
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
            schema: actionAddFormSchema,
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
