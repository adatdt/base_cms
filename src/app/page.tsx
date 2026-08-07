import Link from "next/link";

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Selamat Datang di Sistem Payment Colection Asdp
            </h1>
            <p className="mt-4 max-w-md text-lg text-slate-600">
                Aplikasi pengelolaan pembayaran koleksi di pelabuhan.
            </p>
            <div className="mt-8">
                <Link
                    href="/login"
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition"
                >
                    Masuk ke Aplikasi
                </Link>
            </div>
        </main>
    );
}
