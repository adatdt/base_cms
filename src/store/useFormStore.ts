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

interface BulkMasterConfig {
    key: string;
    // Fungsi opsional untuk mengubah struktur data master dari payload tunggal
    transform?: (data: any) => any[];
}

interface FormState {
    formData: Record<string, any>;
    errors: Record<string, string>;
    isFetchLoading: boolean;
    masterOptions: Record<string, any[]>;
    isMasterLoading: boolean;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => void;
    handleFieldChange: (
        name: string,
        config?: {
            selectBy: "id" | "label";
            options: Array<{ value: string | number; label: string }>;
        },
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
        transform?: (data: TResponse) => TForm,
        customUrl?: string,
    ) => Promise<void>;

    fetchMasterOptions: (
        configs: {
            key: string;
            url: string;
            // 💡 TAMBAHAN: Fungsi opsional untuk mengubah struktur data master secara dinamis
            transform?: (data: any) => any[];
        }[],
        triggerNotification: NotificationTrigger,
    ) => Promise<void>;

     handleFileChange: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;
    fetchBulkMasterOptions: (
        bulkUrl: string,
        configs: Array<{ key: string; transform?: (data: any) => any }>,
        triggerNotification?: (
            message: string,
            type: "success" | "warning",
        ) => void,
        method?: "GET" | "POST" | "PUT",
        requestData?: any, // 💡 TAMBAHKAN BARIS INI
    ) => Promise<void>;
}

export const useFormStore = create<FormState>((set, get) => ({
    formData: {},
    errors: {},
    isFetchLoading: false,

    masterOptions: {},
    isMasterLoading: false,

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
    /*
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
    }, */
    handleFieldChange:
        (
            name: string,
            config?: {
                selectBy: "id" | "label";
                options: Array<{ value: string | number; label: string }>;
            },
        ) =>
        (eOrValue: any) => {
            const hasOptions = config?.options && config.options.length > 0;

            // 💡 SOLUSI UTAMA: Fungsi pencari lokal satu tingkat untuk meratakan kedalaman nesting
            const getMatchedOption = (val: any) => {
                if (!hasOptions) return null;

                const strVal = String(val);
                const lowerVal = strVal.toLowerCase();

                // 💡 SOLUSI MUTLAK: Menggunakan loop tradisional untuk meratakan (flatten) tingkat nesting
                for (const o of config!.options) {
                    if (
                        String(o.value) === strVal ||
                        o.label.toLowerCase() === lowerVal
                    ) {
                        return o;
                    }
                }

                return null;
            };

            // =========================================================================
            // 💡 1. DETEKSI APAKAH DATA YANG MASUK BERUPA ARRAY (SELECT MULTIPLE)
            // =========================================================================
            if (Array.isArray(eOrValue)) {
                let processedArray = [...eOrValue];
                let labelBackupArray = [...eOrValue];

                if (hasOptions) {
                    // const { selectBy } = config!;

                    // Proses konversi nilai utama (ID / Label) - Sekarang murni 1 tingkat nesting
                    processedArray = eOrValue.map((val) => {
                        const found = getMatchedOption(val);
                        if (!found) return val;
                        // return selectBy === "label" ? found.label : found.value;
                        return found.value;
                    });

                    // Proses konversi nilai teks visual cadangan - Sekarang murni 1 tingkat nesting
                    labelBackupArray = eOrValue.map((val) => {
                        const found = getMatchedOption(val);
                        return found ? found.label : String(val);
                    });
                }

                set((state) => {
                    const nextErrors = { ...state.errors };
                    if (nextErrors[name]) delete nextErrors[name];

                    return {
                        formData: {
                            ...state.formData,
                            [name]: processedArray,
                            [`${name}_selected`]: labelBackupArray,
                        },
                        errors: nextErrors,
                    };
                });

                setTimeout(
                    () => console.log("State Terkini (Array):", get().formData),
                    0,
                );
                return; // Early exit
            }

            // =========================================================================
            // 💡 2. LOGIKA UNTUK DATA TUNGGAL (TEXT / SELECT HIERARCHY)
            // =========================================================================
            let rawValue: string | number = "";
            console.log("Data Tunggal Masuk:", eOrValue);

            // Ekstrak nilai mentah menggunakan pengondisian datar flat
            if (
                eOrValue &&
                typeof eOrValue === "object" &&
                "target" in eOrValue
            ) {
                rawValue = (
                    eOrValue.target as HTMLInputElement | HTMLSelectElement
                ).value;
            } else if (
                typeof eOrValue === "string" ||
                typeof eOrValue === "number"
            ) {
                rawValue = eOrValue;
            }

            let finalValue = rawValue.toString();
            let getValue = rawValue.toString();
            let selectedLabel = "";

            // Pencarian data tunggal memanfaatkan fungsi pencari lokal datar
            const foundOpt = getMatchedOption(rawValue);

            if (foundOpt) {
                selectedLabel = foundOpt.label;
                getValue = foundOpt.value.toString();
                finalValue =
                    config!.selectBy === "label"
                        ? foundOpt.label
                        : foundOpt.value.toString();
            }

            set((state) => {
                const nextErrors = { ...state.errors };
                if (nextErrors[name]) delete nextErrors[name];

                const newFormData: Record<string, any> = {
                    ...state.formData,
                    [name]: getValue,
                    [`${name}_selected`]: finalValue,
                };

                if (selectedLabel) {
                    newFormData[`${name}_selected`] = selectedLabel;
                }

                return {
                    formData: newFormData,
                    errors: nextErrors,
                };
            });

            setTimeout(
                () => console.log("State Terkini (Tunggal):", get().formData),
                0,
            );
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

        // =========================================================================
        // 💡 SOLUSI FINAL: Deteksi FileList Berbasis Karakteristik Objek (Duck Typing)
        // =========================================================================
        const sanitizedData: Record<string, any> = {};
        
        Object.entries(currentFormData).forEach(([key, val]) => {
            // Mengecek apakah objek memiliki karakteristik FileList bawaan DOM Browser
            const isFileList = val && typeof val === "object" && "item" in val && "length" in val;

            if (isFileList) {
                const fileListObj = val as FileList;
                // Ekstrak file pertama (Index 0) secara paksa agar tipenya murni menjadi File
                sanitizedData[key] = fileListObj.length > 0 ? fileListObj.item(0) : null;
            } else {
                sanitizedData[key] = val;
            }
        });

        // Sekarang safeParse dijamin menerima objek File murni, BUKAN FileList lagi!
        const result = schema.safeParse(sanitizedData);
        console.log(currentFormData)
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
            const validData = result.data; // Berisi data bersih dari Zod (Objek File murni)

            if (isDelete && validData && Object.keys(validData).length > 0) {
                const queryParams = new URLSearchParams(validData as any).toString();
                targetUrl = `${endpoint}?${queryParams}`;
            }

            // =========================================================================
            // 💡 PEMBENTUKAN PAYLOAD MULTIPART / FORMDATA UNTUK FETCHCLIENT
            // =========================================================================
            let finalDataPayload: any = validData;
            
            // Periksa keberadaan File menggunakan karakteristik properti name & size
            const hasFile = Object.values(validData || {}).some(
                (val) => val && typeof val === "object" && "name" in (val as any) && "size" in (val as any)
            );

            if (hasFile && !isDelete) {
                const formDataBody = new FormData();
                
          Object.entries(validData).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
        const valType = typeof val;

        // 1. Cek apakah ini objek berkas biner tunggal (File murni)
        const isSingleFile = valType === "object" && "name" in (val as any) && "size" in (val as any);
        
        if (isSingleFile) {
            formDataBody.append(key, val as File, (val as File).name);
        } 
        // 2. Cek jika data berupa Array atau Object biasa (Non-File)
        else if (valType === "object" || Array.isArray(val)) {
            formDataBody.append(key, JSON.stringify(val));
        } 
        // 3. 💡 SOLUSI FINAL: Lakukan casting ke primitive (string/any) agar linter tidak mendeteksi object biasa
        else {
            // Memaksa linter menganggap val bukan tipe Object kompleks
            const primitiveValue = val as string | number | boolean;
            formDataBody.append(key, String(primitiveValue));
        }
    }
});

                
                finalDataPayload = formDataBody;
            }

            const responseData = await fetchClient.request<any>(targetUrl, {
                method,
                data: isDelete ? undefined : finalDataPayload,
            });

            triggerNotification("Data berhasil disimpan ke server!", "success");
            get().resetForm();

            if (onSuccess) {
                onSuccess(responseData);
            }

            return responseData;
        } catch (error: any) {
            console.log(`[Fetch Form Error] Failed to ${method} to ${endpoint}:`, error);
            const errorMsg = error?.data?.message || error?.message || "Terjadi kesalahan sistem!";
            triggerNotification(`Terjadi kesalahan: ${errorMsg}`, "warning");
            if (onError) onError(error);
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
        customUrl?: string, // 👈 1. Tambahkan parameter opsional di sini
    ) => {
        set({ isFetchLoading: true, errors: {} });
        try {
            // 👈 2. Gunakan customUrl jika ada, jika tidak ada pakai URL default
            const targetUrl =
                customUrl || `/configuration/menu/api/crud?id=${id}`;

            const response = await fetchClient.request<any>(targetUrl, {
                method: "GET",
            });

            if (response) {
                const apiPayload =
                    response.data !== undefined ? response.data : response;

                const mappedData = transform
                    ? transform(apiPayload)
                    : apiPayload;

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
    // fungsi hit multiple  api
    fetchMasterOptions: async (configs, triggerNotification) => {
        set({ isFetchLoading: true, errors: {} });
        try {
            const requests = configs.map(async (cfg) => {
                const response = await fetchClient.request<any>(cfg.url, {
                    method: "GET",
                });
                const payload =
                    response.data !== undefined ? response.data : response;
                const finalData = cfg.transform
                    ? cfg.transform(payload)
                    : payload;

                return { key: cfg.key, data: finalData };
            });

            const results = await Promise.all(requests);

            const nextMasterOptions = { ...get().masterOptions };
            results.forEach((res) => {
                nextMasterOptions[res.key] = res.data;
            });

            set({ masterOptions: nextMasterOptions });
        } catch (error: any) {
            console.error("[Fetch Master Options Error]:", error);
            const errorMsg =
                error?.data?.message ||
                error?.message ||
                "Gagal memuat opsi pilihan!";
            triggerNotification(
                `Terjadi kesalahan master data: ${errorMsg}`,
                "warning",
            );
        } finally {
            set({ isFetchLoading: false });
        }
    },
    // fungsi hit 1 appi banyak tipe data
    fetchBulkMasterOptions: async (
        bulkUrl,
        configs,
        triggerNotification,
        method = "GET",
        requestData = null,
    ) => {
        set({ isFetchLoading: true, errors: {} });
        try {
            // 🟢 1. Hit API dengan HTTP Method dan Request Body (Payload) yang Dinamis
            const response = await fetchClient.request<any>(bulkUrl, {
                method: method.toUpperCase(),
                // 💡 Jika method-nya POST/PUT, sertakan requestData ke dalam properti data (atau body tergantung Axios/Fetch wrapper Anda)
                data: method.toUpperCase() !== "GET" ? requestData : undefined,
            });
            const payload =
                response.data !== undefined ? response.data : response;

            // 🟢 2. Olah payload tunggal tersebut untuk setiap konfigurasi master key yang diminta
            const results = configs.map((cfg) => {
                const finalData = cfg.transform
                    ? cfg.transform(payload)
                    : payload;
                return { key: cfg.key, data: finalData };
            });

            // 🟢 3. Perbarui state masterOptions di store
            const nextMasterOptions = { ...get().masterOptions };
            results.forEach((res) => {
                nextMasterOptions[res.key] = res.data;
            });

            set({ masterOptions: nextMasterOptions });
        } catch (error: any) {
            console.error("[Fetch Bulk Master Options Error]:", error);
            const errorMsg =
                error?.data?.message ||
                error?.message ||
                "Gagal memuat beberapa opsi pilihan sekaligus!";
            if (triggerNotification) {
                triggerNotification(
                    `Terjadi kesalahan bulk master data: ${errorMsg}`,
                    "warning",
                );
            }
        } finally {
            set({ isFetchLoading: false });
        }
    },
    handleFileChange: (e) => {
        const { name, files } = e.target;
        
        // Pastikan elemen input memiliki atribut 'name' dan memiliki file yang dipilih
        if (!name || !files || files.length === 0) return;

        // Jika input file mendukung multiple, simpan semua file dalam bentuk array. 
        // Jika tidak, ambil file pertama saja (index 0) sebagai objek File tunggal.
        const fileValue = e.target.multiple ? Array.from(files) : files[0];

        set((state) => {
            const nextErrors = { ...state.errors };
            // Hapus error field ini jika ada setelah user memilih file baru
            if (nextErrors[name]) delete nextErrors[name]; 
            
            return {
                formData: { 
                    ...state.formData, 
                    [name]: fileValue // Menyimpan objek File asli, bukan string "C:\fakepath\..."
                },
                errors: nextErrors,
            };
        });
    },
}));
