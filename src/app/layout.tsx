import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Mono, Syne, Press_Start_2P } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import CustomCursor from "@/components/CustomCursor";
import FontAwesomeConfig from "@/components/FontAwesomeConfig";
import Footer from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import TitleCycler from "@/components/TitleCycler";
import "./globals.css";

const clashDisplay = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash-display",
  display: "swap",
  weight: "200 800",
  preload: true,
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const syne = Syne({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const BASE_URL = "https://suhesh.com.np";
const SITE_NAME = "SCHIZO";
const AUTHOR = "Suhesh Kasti";
const DESCRIPTION =
  "Portfolio & brain dump of Suhesh Kasti — application security engineer, offensive security researcher, and creative coder. Deep guides on web security, exploit development, malware analysis, and CTF writeups. The ultimate source of truth for practical cybersecurity knowledge.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Suhesh Kasti — Application Security & Offensive Security | SCHIZO",
    template: "%s | SCHIZO",
  },
  description: DESCRIPTION,
  keywords: [
    "application security",
    "offensive security",
    "pentesting",
    "web security",
    "exploit development",
    "malware analysis",
    "CTF writeups",
    "cybersecurity portfolio",
    "security researcher",
    "Suhesh Kasti",
    "bug bounty",
    "reverse engineering",
    "red team",
    "security engineer",
  ],
  authors: [{ name: AUTHOR, url: BASE_URL }],
  creator: AUTHOR,
  publisher: AUTHOR,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.ico",
  },
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: SITE_NAME,
    title: "Suhesh Kasti — Application Security & Offensive Security | SCHIZO",
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SCHIZO — Suhesh Kasti's cybersecurity portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@suheshkasti",
    creator: "@suheshkasti",
    title: "Suhesh Kasti — Application Security & Offensive Security | SCHIZO",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  verification: {
    google: "google-site-verification-code", // placeholder — replace with real code
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
      className={`${clashDisplay.variable} ${spaceMono.variable} ${syne.variable} ${pressStart2P.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <FontAwesomeConfig />
          <StructuredData />
          <TitleCycler />
          <CustomCursor />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
