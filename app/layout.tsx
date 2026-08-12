import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import { OneSignalInit } from "@/components/onesignal-init";
import { getCurrentUser } from "@/lib/dal";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Kun til tall — timer, datoer og antall skal stå i kolonne
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Loggbok – N&M",
  description: "Loggbok og rapportering for N&M Vaktmesterservice",
  applicationName: "Loggbok",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Loggbok",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="no"
      className={`${sourceSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <OneSignalInit
          externalUserId={
            user && (user.role === "ADMIN" || user.role === "EMPLOYEE")
              ? user.id
              : null
          }
        />
        {children}
      </body>
    </html>
  );
}
