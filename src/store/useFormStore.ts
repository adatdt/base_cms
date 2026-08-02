import { create } from "zustand";
import React from "react";
import { z } from "zod";
import { fetchClient } from "@/services/fetch-client";

// 1. Explicit shared types for HTTP requests and notification systems
export type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export type NotificationTrigger = (
    message: string,
    type: "success" | "warning" | "error",
) => void;

interface FormSubmitOptions<TResponse> {
    onSuccess?: (response: TResponse) => void;
    onError?: (error: any) => void;
}

interface GlobalSubmitConfig<TResponse> extends FormSubmitOptions<TResponse> {
    formKey: string;
    schema: z.ZodType<any, any, any>;
    endpoint: string;
    method?: HttpMethod;
    triggerNotification: NotificationTrigger;
}

interface FormState {
    formData: Record<string, string>;
    errors: Record<string, string>;
    isFetchLoading: boolean;

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

    executeSubmit: <TResponse>(
        e: React.SubmitEvent<HTMLFormElement>,
        config: GlobalSubmitConfig<TResponse>,
    ) => Promise<TResponse | null>;

    resetForm: () => void;

    // 💡 UBAH DI SINI: Tambahkan generic dan callback transform
    fetchFormDetails: <
        TResponse = Record<string, unknown>,
        TForm = Record<string, string>,
    >(
        id: string | number,
        triggerNotification: NotificationTrigger,
        transform?: (data: TResponse) => TForm, // Parameter untuk mengubah / memetakan nama field dari komponen
    ) => Promise<void>;
}

export const useFormStore = create<FormState>((set, get) => ({
    formData: {},
    errors: {},
    isFetchLoading: false,

    // Core Handler: Native HTML Form Inputs (Event Driven)
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

    // Core Handler: Custom Input Components (Raw Value Payload Driven - SonarQube Clean)
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

    // Core Handler: Single and Bulk Polymorphic Error Hydrations
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

    // Master Submit Action: Implements Zod Validation and Intercepts Fetch Client Cycles
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
                if (err.path?.[0] !== undefined) {
                    const key = String(err.path[0]);
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

            // Automatically clean form memory layers when submissions hit a success code
            get().resetForm();

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

            if (onError) {
                onError(error);
            }

            // Return null instead of re-throwing to avoid Next.js unhandled rejection overlays
            return null;
        }
    },

    // Form Clean Engine: Wipes global input values and error trails
    resetForm: () => set({ formData: {}, errors: {}, isFetchLoading: false }),

    // Async Populate Engine: Resolves data objects dynamically over dynamic record parameter IDs
    fetchFormDetails: async <
        TResponse = Record<string, unknown>,
        TForm = Record<string, string>,
    >(
        id: string | number,
        triggerNotification: NotificationTrigger,
        transform?: (data: TResponse) => TForm,
    ) => {
        set({ isFetchLoading: true, errors: {} });
        try {
            const response = await fetchClient.request<any>( // Ubah sementara ke any untuk kemudahan pengecekan
                `/configuration/menu/api/crud?id=${id}`,
                { method: "GET" },
            );

            if (response) {
                // 💡 SOLUSI UTAMA: Bongkar bungkus '.data' jika API Next.js mengirimkannya di dalam envelope
                // Jika response.data ada, gunakan response.data. Jika tidak, gunakan response langsung.
                const apiPayload =
                    response.data !== undefined ? response.data : response;
                // Kirim data yang sudah dibongkar ke fungsi transform komponen
                const mappedData = transform
                    ? transform(apiPayload)
                    : apiPayload;

                console.log(mappedData);
                const sanitizedData: Record<string, string> = {};

                Object.entries(mappedData as Record<string, unknown>).forEach(
                    ([key, val]) => {
                        if (val !== null && val !== undefined) {
                            if (typeof val === "string") {
                                sanitizedData[key] = val;
                            } else if (
                                typeof val === "number" ||
                                typeof val === "boolean" ||
                                typeof val === "bigint"
                            ) {
                                sanitizedData[key] = val.toString();
                            } else if (typeof val === "object") {
                                sanitizedData[key] = JSON.stringify(val);
                            } else {
                                sanitizedData[key] = "";
                            }
                        } else {
                            sanitizedData[key] = "";
                        }
                    },
                );

                set({ formData: sanitizedData });
            }
        } catch (error: any) {
            console.error(
                "[Fetch Detail Error] Failed to get menu details:",
                error,
            );
            const errorMsg =
                error?.data?.message ||
                error?.message ||
                "Gagal memuat detail data!";
            triggerNotification(`Terjadi kesalahan: ${errorMsg}`, "warning");
        } finally {
            set({ isFetchLoading: false });
        }
    },
}));
