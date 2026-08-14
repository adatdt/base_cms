type OptionId = string | number;
type ParentOptionId = OptionId | null;

export interface SelectOption {
    value: OptionId;
    label: string;
    parent?: ParentOptionId;
}

export interface InputSchema {
    name: string;
    variant: string;
    label: string;
    placeholder: string;
    options?: SelectOption[];
    selectBy?: "id" | "label";
    required?: boolean;
    description?: string;
}

export interface UserFormFieldsProps {
    formId: string; // Harus sama dengan ID Modal agar terhubung dengan tombol Simpan
}
