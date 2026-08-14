// src/components/FormFieldRenderer.tsx
import React from "react";
import { InputSchema, SelectOption } from "@/types/form.type";
import { SelectData } from "./SelectData";
import { SelectHierarchyData } from "./SelectHierarchyData";
import { SelectDataMultiple } from "./SelectDataMultiple";
import { InputText } from "./InputText";
import { InputTextArea } from "./InputTextArea ";
import { InputFile } from "./InputFile";

interface FormFieldRendererProps {
    item: InputSchema;
    isMasterLoading: boolean;
    masterOptions: Record<string, SelectOption[]>;
    errors: Record<string, string>;
    formData: Record<string, any>;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => void;
    handleFieldChange: (
        name: string,
        config?: { selectBy: "id" | "label"; options: any[] },
    ) => (eOrValue: any) => void;
}

/**
 * 1. HELPER FUNCTIONS & RENDERING STATEMENT (Ditaruh di luar komponen utama)
 * Bersifat murni (pure function), bebas state, dan mengeliminasi masalah performa re-allocation memori.
 */
const getParsedMultipleValue = (rawData: unknown): (string | number)[] => {
    if (Array.isArray(rawData)) {
        return rawData;
    }
    if (typeof rawData === "string" && rawData.trim() !== "") {
        try {
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch {
            // Mengabaikan kegagalan parsing secara aman tanpa blok kosong
        }
    }
    return [];
};

// Ekstraksi fungsi render utama ke luar komponen induk sesuai instruksi linter/SonarQube
const executeFieldRender = (
    props: Readonly<FormFieldRendererProps>,
): React.ReactNode => {
    const {
        item,
        isMasterLoading,
        masterOptions,
        errors,
        formData,
        handleChange,
        handleFieldChange,
    } = props;

    if (isMasterLoading) {
        return (
            <div className="w-full h-10 bg-slate-100 animate-pulse rounded-lg" />
        );
    }

    const dynamicOptions = masterOptions[item.name] || item.options || [];
    const selectConfig = {
        selectBy: item.selectBy || "id",
        options: dynamicOptions,
    };
    const commonOnChange = handleFieldChange(item.name, selectConfig);

    // Dictionary/Strategy Mapping Pattern untuk mengganti if-else bertingkat
    const fieldRenderers: Record<string, () => React.ReactNode> = {
        select: () => (
            <SelectData
                selectSize="sm"
                name={item.name}
                hasError={!!errors[item.name]}
                defaultValue=""
                onChange={commonOnChange}
                options={dynamicOptions}
            />
        ),
        "select-hierarchy": () => (
            <SelectHierarchyData
                inputSize="sm"
                name={item.name}
                options={dynamicOptions}
                value={formData[item.name]}
                onChange={commonOnChange}
                hasError={!!errors.parent}
                placeholder="Pilih Parent Menu..."
            />
        ),
        "select-multiple": () => (
            <SelectDataMultiple
                name={item.name}
                options={dynamicOptions}
                placeholder="Pilih beberapa hak akses..."
                hasError={!!errors.roles}
                value={getParsedMultipleValue(formData[item.name])}
                onChange={(selectedArray) => {
                    commonOnChange(JSON.stringify(selectedArray));
                }}
            />
        ),
        "text-area": () => (
            <InputTextArea
                inputSize="sm"
                value={formData[item.name] || ""}
                onChange={handleChange}
                hasError={!!errors[item.name]}
                name={item.name}
                placeholder={item.placeholder}
            />
        ),
        "input-file": () => (
            <InputFile
                inputSize="sm"
                value={formData[item.name] || ""}
                onChange={handleChange}
                hasError={!!errors.roles}
                description={item.description}
            />
        ),
    };

    const renderCurrentField = fieldRenderers[item.variant];

    if (renderCurrentField) {
        return renderCurrentField();
    }

    return (
        <InputText
            type={item.variant}
            inputSize="sm"
            value={formData[item.name] || ""}
            onChange={handleChange}
            hasError={!!errors[item.name]}
            name={item.name}
            placeholder={item.placeholder}
        />
    );
};

/**
 * 2. MAIN VISUAL COMPONENT
 * Kodenya sangat bersih, ringan, dan fokus penuh pada penataan layout komponen.
 */
export const FormFieldRenderer: React.FC<FormFieldRendererProps> = (props) => {
    const { item, errors } = props;

    return (
        <div className="flex flex-col gap-1.5">
            {/* Render Label dengan kondisi Bintang Merah dinamis */}
            <label
                htmlFor={item.name}
                className="text-xs font-semibold text-gray-700 flex items-center gap-0.5"
            >
                {item.label}
                {item.required && (
                    <span className="text-red-500 font-bold ml-0.5">*</span>
                )}
            </label>

            {/* 🌟 CARA PANGGIL BARU: Eksekusi fungsi luar dengan mengoper seluruh objek props utuh */}
            {executeFieldRender(props)}

            {/* Render Pesan Error */}
            {errors[item.name] && (
                <p className="mt-1 text-sm text-red-600 font-medium">
                    {errors[item.name]}
                </p>
            )}
        </div>
    );
};
