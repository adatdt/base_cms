import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// PENTING: Nama fungsi HARUS 'proxy' agar dieksekusi oleh Next.js, bukan 'proxy'
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;

  // =======================================================
  // 1. DEFINISIKAN RUTE PUBLIK & AUTH DI SINI
  // =======================================================
  const publicRoutes = ["/about", "/contact", "/terms"]; 
  const authRoutes = ["/login", "/register"]; 

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  // =======================================================
  // 2. PENANGANAN RUTE UTAMA / ROOT ( / )
  // =======================================================
  if (pathname === "/") {
    const targetUrl = sessionToken ? "/home" : "/login";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // =======================================================
  // 3. PENANGANAN RUTE AUTH (Jika sudah login, tendang ke /home)
  // =======================================================
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // =======================================================
  // 4. PENANGANAN RUTE TERPROTEKSI
  // =======================================================
  const isProtectedRoute = !isAuthRoute && !isPublicRoute && !pathname.startsWith("/_next");

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

  // =======================================================
  // 5. PENERUSAN DATA & UNIFIED RESPONSE
  // =======================================================
  const userGroup = sessionToken ? (request.cookies.get("user_group")?.value || "0") : "0";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("user_group", userGroup);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // =======================================================
  // LOGIKA BARU: MENAMBAHKAN CSP HEADER DI SINI
  // =======================================================
  // Menyiapkan string aturan CSP. Ubah 'self' atau tambah domain luar jika memuat skrip/gambar API eksternal
  const cspHeaderValue = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://indonesiasatu.co.id;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' ws://localhost:* http://localhost:* ws://127.0.0.1:* http://127.0.0.1:*;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();
  // Sematkan aturan CSP ke dalam Header Response
  response.headers.set("Content-Security-Policy", cspHeaderValue);

  // =======================================================
  // 6. ROLLING SESSION (PERPANJANG OTOMATIS)
  // =======================================================
  if (sessionToken && isProtectedRoute) {
    const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;
    const cookieOptions = {
      maxAge: TWO_HOURS_IN_SECONDS,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    response.cookies.set("session_token", sessionToken, cookieOptions);

    const userGroupCookie = request.cookies.get("user_group")?.value;
    if (userGroupCookie) {
      response.cookies.set("user_group", userGroupCookie, cookieOptions);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|images/.*).*)",
  ],
};
