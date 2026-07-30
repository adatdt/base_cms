import { create } from "zustand";
import React from "react";
import { z } from "zod";
import { fetchClient } from "@/services/fetch-client";

export type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

interface FormSubmitOptions<TResponse> {
    onSuccess?: (response: TResponse) => void;
    onError?: (error: any) => void;
}

interface GlobalSubmitConfig<TResponse> extends FormSubmitOptions<TResponse> {
    formKey: string;
    schema: z.ZodType<any, any, any>;
    endpoint: string;
    method?: HttpMethod;
    triggerNotification: (
        message: string,
        type: "success" | "warning" | "error",
    ) => void;
}

interface FormState {
    formData: Record<string, string>;
    errors: Record<string, string>;
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    handleFieldChange: (
        name: string,
    ) => (
        eOrValue:
            | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
            | string
            | number,
    ) => void;
    setErrors: (
        nameOrErrors: string | Record<string, string>,
        errorMessage?: string,
    ) => void;

    // 💡 FIXED: Replaced React.FormEvent with the modern React.SubmitEvent type
    executeSubmit: <TResponse>(
        e: React.SubmitEvent<HTMLFormElement>,
        config: GlobalSubmitConfig<TResponse>,
    ) => Promise<TResponse | null>;

    resetForm: () => void;
}

export const useFormStore = create<FormState>((set, get) => ({
    formData: {},
    errors: {},

    handleChange: (e) => {
        const { name, value } = e.target;
        set((state) => {
            const nextErrors = { ...state.errors };
            if (nextErrors[name]) delete nextErrors[name];
            return {
                formData: { ...state.formData, [name]: value },
                errors: nextErrors,
            };
        });
    },

    handleFieldChange: (name: string) => (eOrValue) => {
        let value: string = "";
        if (eOrValue && typeof eOrValue === "object" && "target" in eOrValue) {
            const target = eOrValue.target as
                | HTMLInputElement
                | HTMLSelectElement;
            value = target.value;
        } else if (typeof eOrValue === "string") {
            value = eOrValue;
        } else if (typeof eOrValue === "number") {
            value = eOrValue.toString();
        }

        set((state) => {
            const nextErrors = { ...state.errors };
            if (nextErrors[name]) delete nextErrors[name];
            return {
                formData: { ...state.formData, [name]: value },
                errors: nextErrors,
            };
        });
    },

    setErrors: (nameOrErrors, errorMessage) =>
        set((state) => {
            const nextErrors = { ...state.errors };
            if (typeof nameOrErrors === "object" && nameOrErrors !== null) {
                return { errors: { ...nextErrors, ...nameOrErrors } };
            }
            if (errorMessage) {
                nextErrors[nameOrErrors] = errorMessage;
            } else {
                delete nextErrors[nameOrErrors];
            }
            return { errors: nextErrors };
        }),

    // 💡 FIXED: Updated implementation payload parameter to match SubmitEvent
    executeSubmit: async (e, config) => {
        e.preventDefault();
        const {
            schema,
            endpoint,
            method = "POST",
            onSuccess,
            onError,
            triggerNotification,
        } = config;

        const currentFormData = get().formData;
        const result = schema.safeParse(currentFormData);

        if (!result.success) {
            const formattedErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                if (err.path !== undefined) {
                    const key = String(err.path);
                    formattedErrors[key] = err.message;
                }
            });

            get().setErrors(formattedErrors);
            console.log("Validasi Gagal:", formattedErrors);
            return null;
        }

        try {
            const isDelete = method.toUpperCase() === "DELETE";
            let targetUrl = endpoint;
            const validData = result.data;

            if (isDelete && validData && Object.keys(validData).length > 0) {
                const queryParams = new URLSearchParams(
                    validData as any,
                ).toString();
                targetUrl = `${endpoint}?${queryParams}`;
            }

            const responseData = await fetchClient.request<any>(targetUrl, {
                method,
                data: isDelete ? undefined : validData,
            });

            triggerNotification("Data berhasil disimpan ke server!", "success");

            if (onSuccess) {
                onSuccess(responseData);
            }

            return responseData;
        } catch (error: any) {
            console.log(
                `[Fetch Form Error] Failed to ${method} to ${endpoint}:`,
                error,
            );
            const errorMsg =
                error?.data?.message ||
                error?.message ||
                "Terjadi kesalahan sistem!";
            triggerNotification(`Terjadi kesalahan: ${errorMsg}`, "warning");

            if (onError) onError(error);
            throw error;
        }
    },
    resetForm: () => set({ formData: {}, errors: {} }),
}));
