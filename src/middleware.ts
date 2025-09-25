import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

// Definisikan tipe token yang diperbarui
interface CustomToken {
  id: string;
  role: Role;
  email: string;
  name: string;
}

export default withAuth(
  function middleware(req) {
    // Token tersedia karena withAuth sudah memvalidasi
    const token = req.nextauth.token as CustomToken | null;
    const isAdmin = token?.role === "ADMIN";
    const isUser = token?.role === "USER";

    // Proteksi route /admin/** hanya untuk admin
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.rewrite(new URL("/auth/unauthorized", req.url));
    }

    // Proteksi route /dashboard untuk user dan admin
    if (req.nextUrl.pathname.startsWith("/dashboard") && !isUser && !isAdmin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Redirect berdasarkan role setelah login
    if (req.nextUrl.pathname === "/") {
      if (token) {
        if (isAdmin) {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        } else {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Untuk route yang diproteksi, return true jika token ada
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/"],
};
