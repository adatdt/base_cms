import { create } from "zustand";

interface ModalState {
    activeModalId: string | null;
    modalData: Record<string, any> | null;
    isOpeningWithData: boolean; // 💡 1. Daftarkan flag penanda ini
    openModal: (id: string, data?: Record<string, any> | null) => void;
    openModalOnly: (id: string) => void;
    closeModal: () => void;
    closeModalOnly: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    activeModalId: null,
    modalData: null,
    isOpeningWithData: false, // Default awal false

    // Jalur Reguler: Reset form diizinkan karena membawa data baru/null baru
    openModal: (id: string, data = null) =>
        set({
            activeModalId: id,
            modalData: data,
            isOpeningWithData: true, // 💡 2. Set true di sini
        }),

    // Jalur Khusus: Reset form dilarang karena hanya perpindahan visual screen
    openModalOnly: (id: string) =>
        set({
            activeModalId: id,
            isOpeningWithData: false, // 💡 3. Set false di sini
        }),

    closeModal: () =>
        set({
            activeModalId: null,
            modalData: null,
            isOpeningWithData: false,
        }),

    closeModalOnly: () =>
        set({
            activeModalId: null,
            isOpeningWithData: false,
        }),
}));
