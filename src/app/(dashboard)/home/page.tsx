import Image from "next/image";

export default function HomePage() {
      return (
        /* 
          PENTING: Tambahkan 'z-0' pada kontainer utama ini 
          agar seluruh isinya berada di bawah menu header/dropdown Anda 
        */
        <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-900 z-0">
            {/* 1. GAMBAR ILUSTRASI PAYMENT & KAPAL ASDP HIGH-RES */}
            <Image
                src="/images/bg_image.png"
                alt="ASDP Payment Collection and Port Operations"
                fill
                priority
                sizes="100vw"
                // z-0 memastikan gambar tetap berada di lapisan paling belakang kontainer ini
                className="object-cover opacity-50 object-center z-0" 
            />

            {/* 2. LAPISAN GELAP (OVERLAY GRADASI MODERN) */}
            {/* Diturunkan ke z-1 agar tetap di atas gambar (z-0) tapi di bawah konten teks */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/50 to-slate-900/10 z-1" />

            {/* 3. KONTEN TEKS UTAMA */}
            {/* Diturunkan ke z-2 agar berada di atas overlay gelap, namun aman di bawah dropdown header */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-2">
                {/* Teks Selamat Datang di Bagian Bawah Layar */}
                <main className="max-w-2xl mb-6">
                    <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 backdrop-blur-md mb-3 border border-blue-500/30 tracking-wide uppercase">
                        Sistem Payment Collection
                    </span>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl drop-shadow-md">
                        Selamat Datang di{" "}
                        <span className="text-blue-400">ASDP</span>
                    </h1>

                    <p className="mt-3 text-sm md:text-base text-slate-200 drop-shadow max-w-xl font-normal leading-relaxed">
                        Sistem integrasi pelayanan pembayaran penyeberangan digital, 
                        logistik kapal, dan pengelolaan operasional pelabuhan Indonesia Ferry secara real-time.
                    </p>
                </main>
            </div>
        </div>
    );
}
