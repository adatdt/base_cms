type OptionId = string | number;
type ParentOptionId = OptionId | null;

interface SelectOption {
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
}

export interface DocumentData {
    id: number | string;
    parentId: number | string | null;
    isLeaf: boolean;
    name: string;
    owner: string;
}

export interface RawDatabaseMenu {
    id: number | string;
    parent_id: number | string | null;
    name: string;
    slug: string;
    order: number;
}

export interface MyApiDetails {
    name: string;
    // action: string;
    icon: string;
    order: string;
    parent_id: string;
    parent_name: string;
    slug: string;
    action_id: (string | number)[];
    action_name: (string | number)[];
}

// 2. Definisikan bentuk data yang diinginkan oleh Komponen Form Anda
export interface MyComponentFields {
    menu: string;
    // action: string;
    icon: string;
    order: string;
    parent: string;
    parent_selected: string;
    url: string;
    action: (string | number)[];
    action_selected: (string | number)[];
}
