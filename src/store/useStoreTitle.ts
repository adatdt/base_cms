import { create } from "zustand";

interface TitleState {
    activeModule: string;
    activeModuleDescription: string; // 🌟 Perbaikan typo: ditambahkan huruf 't' (Description)
    setActiveModule: (pathname: string, description?: string) => void; // 🌟 Dibuat fleksibel agar bisa menerima deskripsi kustom dari luar
}

export const useStoreTitle = create<TitleState>((set) => ({
    // 👑 PERBAIKAN: Gunakan tanda titik dua (:) untuk objek, bukan tanda sama dengan (=)
    activeModuleDescription: "",
    activeModule: "",

    // Action untuk mendeteksi dan memformat nama modul berdasarkan rute URL
    setActiveModule: (pathname: string, description: string = "tes") => {
        if (!pathname) return;

        // 1. Bersihkan tanda slash '/' di awal dan ubah ke Huruf Kapital
        const rawPath = pathname.replace(/^\//, "").toUpperCase();

        // 2. Format sub-rute agar memiliki spasi rapi: 'OPERATIONAL / PORT-BRANCH'
        const formattedPath = rawPath.includes("/")
            ? rawPath.replaceAll("/", " / ")
            : rawPath;

        // 3. Menghasilkan judul modul yang bersih dengan spasi rapi di akhir
        const result = `${formattedPath} `;

        // 👑 PERBAIKAN: Menyimpan data state dengan nama properti objek yang sudah diperbaiki
        set({
            activeModule: result,
            activeModuleDescription: description,
        });
    },
}));
