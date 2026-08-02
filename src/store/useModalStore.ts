import { create } from "zustand";

interface ModalState {
    activeModalId: string | null;
    // 💡 SOLUSI: Tambahkan '| null' agar TypeScript mengizinkan nilai awal null
    modalData: Record<string, any> | null;
    openModal: (id: string, data?: Record<string, any> | null) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    activeModalId: null,
    modalData: null, // Sekarang pengisian null di sini sudah legal bagi linter

    openModal: (id: string, data = null) =>
        set({
            activeModalId: id,
            modalData: data,
        }),

    closeModal: () =>
        set({
            activeModalId: null,
            modalData: null, // Pembersihan dengan nilai null juga aman
        }),
}));
