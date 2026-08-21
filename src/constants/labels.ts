export const masterLabels = {
    // Contoh 1: Pesan Selamat Datang (Nama & Level)
    modalText: {
        title: (data: string) => `Konfirmasi ${data}`,
        titleNotif: (data1: string) =>
            `Anda yakin untuk melakukan ${data1}  ini?`,
        description: `Pastikan semua data yang Anda masukkan sudah sesuai jika belum sesuai Anda bisa melakukan pengecekan kembali"`,
        confirmation: (data: string) => `Anda yakin untuk ${data}`,
        confirmTextBtn: (data1: string) => `Ya, ${data1} data sekarang`,
    },
} as const;
