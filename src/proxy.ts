// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Diubah namanya dari proxy ke middleware standar Next.js
  const { pathname } = request.nextUrl;

  // 1. Ambil token sesi dari cookie
  const sessionToken = request.cookies.get("session_token")?.value;

  // 2. Tentukan rute publik
  const publicRoutes = ["/login", "/"];
  const isAuthRoute = publicRoutes.includes(pathname);

  // Rute terproteksi adalah rute yang BUKAN auth route DAN BUKAN file statis internal Next.js
  const isProtectedRoute = !isAuthRoute && !pathname.startsWith("/_next");

  // CASE A: User belum login tapi mencoba mengakses halaman terproteksi
  // Tambahkan pengecekan agar request API dikembalikan sebagai 401 Unauthorized, bukan di-redirect ke halaman login (agar tidak merusak fetch frontend)
  if (isProtectedRoute && !sessionToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASE B: User sudah login tapi mencoba kembali ke halaman login atau landing awal
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/analytics", request.url));
  }

  // 3. Ambil data userGroup (Sesuaikan dengan cookie/JWT Anda)
  let userGroup = "1";
  if (sessionToken) {
    const userGroupCookie = request.cookies.get("user_group")?.value;
    if (userGroupCookie) userGroup = userGroupCookie;
  }

  // 4. Meneruskan userGroup ke Server Components & API Melalui Headers
  const requestHeaders = new Headers(request.headers);
  // DISUAIKAN: Menggunakan nama 'user_group' agar sama persis dengan yang dicari di API Route
  requestHeaders.set("user_group", userGroup);

  // Buat respons dasar dengan header baru
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // =======================================================
  // LOGIKA BARU: ROLLING SESSION (PERPANJANG OTOMATIS 2 JAM)
  // =======================================================
  if (sessionToken && isProtectedRoute) {
    const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;

    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      maxAge: TWO_HOURS_IN_SECONDS,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    const userGroupCookie = request.cookies.get("user_group")?.value;
    if (userGroupCookie) {
      response.cookies.set({
        name: "user_group",
        value: userGroupCookie,
        maxAge: TWO_HOURS_IN_SECONDS,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  }

  return response;
}

// 5. KONFIGURASI MATCHER DIUBAH
// Sekarang /api DIKONTROL oleh middleware agar header bisa masuk saat fetch data menu
export const config = {
  matcher: [
    /*
     * Cocokkan semua jalur permintaan kecuali:
     * - _next/static (file statis)
     * - _next/image (gambar optimasi Next.js)
     * - favicon.ico, images, dll (file publik)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|images/.*).*)",
  ],
};
