import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Saira_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SwRegister from "@/components/pwa/sw-register";
import InstallPrompt from "@/components/pwa/install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Broadcast Booth display face — used for headlines, eyebrows, scoreboard numerals.
const sairaCondensed = Saira_Condensed({
  variable: "--font-saira",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

// Telemetry / timestamp face.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#512f75" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0f24" },
  ],
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  title: "PitOS",
  description: "AI-native team platform for FRC",
  applicationName: "PitOS",
  manifest: "/manifest.json",
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/apple-touch-icon-167.png", sizes: "167x167" },
      { url: "/apple-touch-icon-152.png", sizes: "152x152" },
      { url: "/apple-touch-icon-120.png", sizes: "120x120" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PitOS",
    startupImage: [
      { url: "/splash/splash-640x1136.png", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-1242x2208.png", media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-828x1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1536x2048.png", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
    ],
  },
  openGraph: {
    title: "PitOS",
    description: "AI-native team platform for FRC",
    images: [{ url: "/logo.png", width: 1254, height: 1254 }],
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
      className={`${geistSans.variable} ${geistMono.variable} ${sairaCondensed.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Runs before first paint — applies dark class from localStorage or system pref */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pitos-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})()`,
          }}
        />
        {children}
        <SwRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
