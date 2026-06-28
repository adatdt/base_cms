import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Nama fungsi middleware default Next.js harus bernama 'middleware' agar terbaca otomatis
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ambil token sesi dari cookie
  const sessionToken = request.cookies.get("session_token")?.value;

  // 2. Tentukan halaman yang boleh diakses publik tanpa login
  const publicRoutes = ["/login", "/"];
  const isAuthRoute = publicRoutes.includes(pathname);

  // 3. Logika Terbalik: Semua rute adalah rute terproteksi (isi folder dashboard) 
  // KECUALI rute publik yang terdaftar di atas
  const isProtectedRoute = !isAuthRoute;

  // CASE A: User belum login tapi mencoba mengakses halaman terproteksi ((dashboard))
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASE B: User sudah login tapi mencoba kembali ke halaman login atau landing awal
  if (isAuthRoute && sessionToken) {
    // Diarahkan ke salah satu rute utama di dalam folder (dashboard), misal '/analytics' atau '/overview'
    return NextResponse.redirect(new URL("/analytics", request.url)); 
  }

  // Lanjutkan request jika tidak ada aturan yang dilanggar
  return NextResponse.next();
}

// 4. KONFIGURASI MATCHER
// Memastikan middleware tidak memproses file aset, gambar, dan internal Next.js
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
