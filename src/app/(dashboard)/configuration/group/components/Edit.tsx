"use client";

import React, { useEffect, useRef } from "react";
import type { InputSchema, UserFormFieldsProps } from "@/types/form.type";
import { groupEditFormSchema } from "../schema/group.schema";
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
        required: true,
    },
    {
        name: "description",
        label: "Deskripsi Grup",
        variant: "text-area",
        placeholder: "Masukkan deskripsi ",
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
                schema: groupEditFormSchema,
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
            schema: groupEditFormSchema,
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
