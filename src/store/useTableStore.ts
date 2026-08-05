import { create } from "zustand";

export interface TableState {
    page: number;
    limit: number;
    typedQuery: string;
    loadData: boolean;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setTypedQuery: (query: string) => void;
    setLoadData: (loading: boolean) => void; // <-- TAMBAHKAN LINE INI
    handleRefresh: (
        fetchDataFn: (page: number, limit: number, query: string) => void,
    ) => void;
    handleKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement>,
        fetchDataFn: (page: number, limit: number, query: string) => void,
    ) => void;
}

interface RootTableStore {
    users: TableState;
    products: TableState;
}

const createTableSlice = (
    set: any,
    get: any,
    sliceKey: keyof RootTableStore,
) => ({
    page: 1,
    limit: 10,
    typedQuery: "",
    loadData: false,
    setPage: (page: number) =>
        set((state: any) => ({ [sliceKey]: { ...state[sliceKey], page } })),
    setLimit: (limit: number) =>
        set((state: any) => ({ [sliceKey]: { ...state[sliceKey], limit } })),
    setTypedQuery: (typedQuery: string) =>
        set((state: any) => ({
            [sliceKey]: { ...state[sliceKey], typedQuery },
        })),

    // TAMBAHKAN IMPLEMENTASI FUNGSI DI SINI
    setLoadData: (loadData: boolean) =>
        set((state: any) => ({ [sliceKey]: { ...state[sliceKey], loadData } })),

    handleRefresh: (
        fetchDataFn: (page: number, limit: number, query: string) => void,
    ) => {
        const slice = get()[sliceKey];

        // Cukup panggil fungsi fetch data saja, biarkan fungsi fetch yang mengelola status loading
        fetchDataFn(slice.page, slice.limit, slice.typedQuery);

        // ❌ HAPUS ATAU KOMENTARI LINE DI BAWAH INI:
        // set((state: any) => ({
        //   [sliceKey]: { ...state[sliceKey], loadData: !state[sliceKey].loadData }
        // }));
    },

    handleKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement>,
        fetchDataFn: (page: number, limit: number, query: string) => void,
    ) => {
        if (e.key === "Enter") {
            get()[sliceKey].handleRefresh(fetchDataFn);
        }
    },
});

export const useTableStore = create<RootTableStore>((set, get) => ({
    users: createTableSlice(set, get, "users") as TableState,
    products: createTableSlice(set, get, "products") as TableState,
}));
