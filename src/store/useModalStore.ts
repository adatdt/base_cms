import { create } from "zustand";

// 1. Definisikan tipe data untuk State dan Action
interface ModalState {
  activeModalId: string | null; // Menyimpan ID modal yang sedang aktif/terbuka
  openModal: (id: string) => void; // Fungsi untuk membuka modal berdasarkan ID
  closeModal: () => void; // Fungsi untuk menutup modal yang sedang terbuka
}

// 2. Buat store menggunakan hooks create dari Zustand
export const useModalStore = create<ModalState>((set) => ({
  activeModalId: null, // Kondisi awal (default) semua modal tertutup

  openModal: (id: string) =>
    set({
      activeModalId: id,
    }),

  closeModal: () =>
    set({
      activeModalId: null,
    }),
}));
