interface SelectOption {
    value: string | number;
    label: string;
    parent?: string | number | null;
}

export interface InputSchema {
    name: string;
    variant: string;
    label: string;
    placeholder: string;
    options?: SelectOption[];
}
