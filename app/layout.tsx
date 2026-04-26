import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Saira_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  themeColor: "#512f75",
};

export const metadata: Metadata = {
  title: "PitOS",
  description: "AI-native team platform for FRC",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PitOS",
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
      className={`${geistSans.variable} ${geistMono.variable} ${sairaCondensed.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()))}`,
          }}
        />
      </body>
    </html>
  );
}
