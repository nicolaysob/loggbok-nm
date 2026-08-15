import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AddToHomeScreenPrompt } from "@/components/add-to-home-screen";
import { CapacitorShell } from "@/components/capacitor-shell";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
  other: {
    "supported-color-schemes": "light dark",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  // Må matche --canvas i globals.css for begge modusene, ellers blinker
  // statuslinja i feil farge når appen åpnes.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ef" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0d" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="no"
      className={`${jakarta.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CapacitorShell />
        <AddToHomeScreenPrompt />
        {children}
      </body>
    </html>
  );
}
