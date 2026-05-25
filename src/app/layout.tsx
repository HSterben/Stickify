import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteTitle = "Stickify | Your Knowledge Board";
const siteDescription =
  "Save, organize, and revisit everything that matters. A structured personal knowledge board for mixed content.";

export async function generateMetadata(): Promise<Metadata> {
  // Scrapers need absolute URLs. Using request headers avoids cases where
  // build-time env vars are missing (which can accidentally point to localhost).
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const metadataBase = host
    ? new URL(`${proto}://${host}`)
    : getSiteUrl();
  const previewImageUrl = new URL("/web-preview.jpg", metadataBase).toString();

  return {
    metadataBase,
    title: siteTitle,
    description: siteDescription,
    keywords: [
      "knowledge board",
      "notes",
      "bookmarks",
      "code snippets",
      "organizer",
    ],
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      type: "website",
      images: [
        {
          url: previewImageUrl,
          alt: siteTitle,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [previewImageUrl],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
        { url: "/icon.png", type: "image/png", sizes: "256x256" },
      ],
      shortcut: { url: "/favicon.ico", type: "image/x-icon" },
      apple: { url: "/icon.png", type: "image/png", sizes: "256x256" },
    },
    verification: {
      google: "QhMBV989EY0RI4qnyU82UIeTLWdq5BiyhBlmWVRzMpM",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased">
        <div className="noise-overlay" />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid #27272a",
              color: "#fafafa",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
