interface SelectOption {
    value: string | number;
    label: string;
}

export interface InputSchema {
    name: string;
    variant: string;
    label: string;
    placeholder: string;
    options?: SelectOption[];
}
