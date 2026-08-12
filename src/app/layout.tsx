import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { RouteEffects } from "../components/ui/RouteEffects";
import { ServiceWorkerRegister } from "../components/ui/ServiceWorkerRegister";
import { InstallPrompt } from "../components/ui/InstallPrompt";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const inter = Inter({
  variable: "--font-inter-next",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-next",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RRise | Rise. Build. Become.",
  description:
    "RRise is a premium personal development workspace built by a high schooler obsessed with bridging the gap between knowing what to do and actually doing it.",
  keywords: ["productivity", "habits", "personal development", "AI companion", "accountability"],
  openGraph: {
    title: "RRise | Rise. Build. Become.",
    description: "Track habits, smash goals, and level up — with RRise.",
    type: "website",
    siteName: "RRise",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "RRise" }],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "RRise",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <RouteEffects />
        <ServiceWorkerRegister />
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}
