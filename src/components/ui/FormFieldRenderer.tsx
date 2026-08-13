// src/components/FormFieldRenderer.tsx
import React from "react";
import { InputSchema, SelectOption } from "@/types/form.type";
import { SelectData } from "./SelectData";
import { SelectHierarchyData } from "./SelectHierarchyData";
import { SelectDataMultiple } from "./SelectDataMultiple";
import { InputText } from "./InputText";

interface FormFieldRendererProps {
    item: InputSchema;
    isMasterLoading: boolean;
    masterOptions: Record<string, SelectOption[]>;
    errors: Record<string, string>;
    formData: Record<string, any>;
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    handleFieldChange: (
        name: string,
        config?: { selectBy: "id" | "label"; options: any[] },
    ) => (eOrValue: any) => void;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
    item,
    isMasterLoading,
    masterOptions,
    errors,
    formData,
    handleChange,
    handleFieldChange,
}) => {
    // Skeletal Loading dipindahkan ke area render field saja agar label tetap terlihat stabil
    const renderField = () => {
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

        if (item.variant === "select") {
            return (
                <SelectData
                    selectSize={"sm"}
                    name={item.name}
                    hasError={!!errors[item.name]}
                    defaultValue=""
                    onChange={handleFieldChange(item.name, selectConfig)}
                    options={dynamicOptions}
                />
            );
        }

        if (item.variant === "select-hierarchy") {
            return (
                <SelectHierarchyData
                    inputSize={"sm"}
                    name={item.name}
                    options={dynamicOptions}
                    value={formData[item.name]}
                    onChange={handleFieldChange(item.name, selectConfig)}
                    hasError={!!errors.parent}
                    placeholder="Pilih Parent Menu..."
                />
            );
        }

        if (item.variant === "select-multiple") {
            const rawData = formData[item.name];
            let currentValue: (string | number)[] = [];

            if (typeof rawData === "string" && rawData.trim() !== "") {
                try {
                    const parsed = JSON.parse(rawData);
                    if (Array.isArray(parsed)) currentValue = parsed;
                } catch (e) {
                    console.log(e);
                    currentValue = [];
                }
            } else if (Array.isArray(rawData)) {
                currentValue = rawData;
            }

            return (
                <SelectDataMultiple
                    name={item.name}
                    options={dynamicOptions}
                    placeholder="Pilih beberapa hak akses..."
                    hasError={!!errors["roles"]}
                    value={currentValue}
                    onChange={(selectedArray) => {
                        const valueToSave = JSON.stringify(selectedArray);
                        handleFieldChange(item.name, selectConfig)(valueToSave);
                    }}
                />
            );
        }

        return (
            <InputText
                type={item.variant}
                inputSize={"sm"}
                value={formData[item.name] || ""}
                onChange={handleChange}
                hasError={!!errors[item.name]}
                name={item.name}
                placeholder={item.placeholder}
                // required={item.required} // Menggunakan nilai boolean dinamis dari schema
            />
        );
    };

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

            {/* Render Field Input */}
            {renderField()}

            {/* Render Pesan Error */}
            <p className="mt-1 text-sm text-red-600 font-medium">
                {errors[item.name] || ""}
            </p>
        </div>
    );
};
