import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ambil token sesi dari cookie
  const sessionToken = request.cookies.get("session_token")?.value;

  // 2. Tentukan rute publik
  const publicRoutes = ["/login", "/"];
  const isAuthRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = !isAuthRoute;

  // CASE A: User belum login tapi mencoba mengakses halaman terproteksi
  if (isProtectedRoute && !sessionToken) {
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

  // 4. Meneruskan userGroup ke Server Components melalui Headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-group", userGroup);

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
    // 2 Jam = 2 * 60 menit * 60 detik = 7200 detik
    const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;

    // Set ulang cookie session_token agar umurnya bertambah 2 jam dari sekarang
    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      maxAge: TWO_HOURS_IN_SECONDS, // Detik
      path: "/",
      httpOnly: true, // Amankan dari pencurian JavaScript (XSS)
      secure: process.env.NODE_ENV === "production", // Wajib HTTPS di production
      sameSite: "lax",
    });

    // Perbarui juga cookie user_group jika ada
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

// 5. KONFIGURASI MATCHER
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
