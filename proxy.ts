import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

// Rask forhåndssjekk som bare leser cookien. Den egentlige verifiseringen
// skjer i requireUser() i lib/dal.ts, som slår opp mot databasen.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Destinasjon etter innlogging styres i login-action (ansatt → /, kunde → /portal)
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Statiske filer (logo, ikon, OneSignal service worker, …) skal ikke kreve innlogging
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|OneSignalSDKWorker\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
