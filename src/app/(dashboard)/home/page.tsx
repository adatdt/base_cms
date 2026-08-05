import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
    return (
        /* Mengisi sisa ruang di bawah header (Tinggi Layar - 64px Tinggi Header) */
        <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-900">
            {/* 1. GAMBAR KAPAL ASDP FULLSCREEN */}
            {/* Simpan file gambar kapal Anda di folder: public/images/kapal-asdp.jpg */}
            <Image
                src="/images/kapal-asdp.jpg"
                alt="Kapal ASDP Indonesia Ferry"
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-60 object-center"
            />

            {/* 2. LAPISAN GELAP (OVERLAY MODERN) */}
            {/* Membuat teks putih di atas gambar kontras dan sangat mudah dibaca */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-slate-900/10" />

            {/* 3. KONTEN UTAMA */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-10">
                {/* Teks Selamat Datang di Bagian Bawah Layar */}
                <main className="max-w-2xl mb-6">
                    <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400 backdrop-blur-md mb-3 border border-blue-500/30 tracking-wide">
                        Dermaga Operasional Aktif
                    </span>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl drop-shadow-md">
                        Selamat Datang di{" "}
                        <span className="text-blue-400">ASDP</span>
                    </h1>

                    <p className="mt-3 text-sm md:text-base text-slate-300 drop-shadow max-w-md font-light leading-relaxed">
                        Sistem integrasi pelayanan penyeberangan, logistik
                        kapal, dan pengelolaan operasional pelabuhan Indonesia
                        Ferry.
                    </p>
                </main>
            </div>
        </div>
    );
}
