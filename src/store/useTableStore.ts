import { create } from "zustand";

// 1. DEFINISI TIPE GENERIK UNTUK SATU TABEL
export interface TableState {
    page: number;
    limit: number;
    typedQuery: string;
    loadData: boolean;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setTypedQuery: (query: string) => void;
    setLoadData: (loading: boolean) => void;
    handleRefresh: (
        fetchDataFn: (page: number, limit: number, query: string) => void,
    ) => void;
    handleKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement>,
        fetchDataFn: (page: number, limit: number, query: string) => void,
    ) => void;
}

// 2. ROOT STORE MENGGUNAKAN DYNAMIC KEY RECORD
// Menggunakan string agar modul apa pun ("users", "products", "orders", dst) bisa masuk otomatis
interface GenericTableStore {
    tables: Record<string, TableState | undefined>;
    getTableState: (tableKey: string) => TableState;
}

// Nilai standar/awal untuk setiap tabel baru
const initialTableState = {
    page: 1,
    limit: 10,
    typedQuery: "",
    loadData: false,
};

// 3. IMPLEMENTASI STORE GENERIK
export const useTableStore = create<GenericTableStore>((set, get) => ({
    // Menyimpan semua state tabel berdasarkan nama kuncinya
    tables: {},

    // Fungsi pintar: Ambil state jika sudah ada, atau buat baru secara otomatis jika belum terdaftar
    getTableState: (tableKey: string): TableState => {
        const currentTable = get().tables[tableKey];
        if (currentTable) return currentTable;

        // Jika kunci tabel belum ada di memori, buat definisinya sekarang secara dinamis
        const newTableSlice: TableState = {
            ...initialTableState,
            setPage: (page) =>
                set((state) => ({
                    tables: {
                        ...state.tables,
                        [tableKey]: { ...get().getTableState(tableKey), page },
                    },
                })),
            setLimit: (limit) =>
                set((state) => ({
                    tables: {
                        ...state.tables,
                        [tableKey]: { ...get().getTableState(tableKey), limit },
                    },
                })),
            setTypedQuery: (typedQuery) =>
                set((state) => ({
                    tables: {
                        ...state.tables,
                        [tableKey]: {
                            ...get().getTableState(tableKey),
                            typedQuery,
                        },
                    },
                })),
            setLoadData: (loadData) =>
                set((state) => ({
                    tables: {
                        ...state.tables,
                        [tableKey]: {
                            ...get().getTableState(tableKey),
                            loadData,
                        },
                    },
                })),
            handleRefresh: (fetchDataFn) => {
                const slice = get().getTableState(tableKey);
                fetchDataFn(slice.page, slice.limit, slice.typedQuery);
            },
            handleKeyDown: (e, fetchDataFn) => {
                if (e.key === "Enter") {
                    get().getTableState(tableKey).handleRefresh(fetchDataFn);
                }
            },
        };

        // Simpan slice baru ke dalam object store utama
        set((state) => ({
            tables: { ...state.tables, [tableKey]: newTableSlice },
        }));

        return newTableSlice;
    },
}));
