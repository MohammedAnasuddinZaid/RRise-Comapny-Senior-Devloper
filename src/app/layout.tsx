import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { CustomCursor } from "../components/ui/CustomCursor";
import { CinematicLoader } from "../components/ui/CinematicLoader";

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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CinematicLoader />
        <CustomCursor />
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
