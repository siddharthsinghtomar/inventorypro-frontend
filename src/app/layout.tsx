import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InventoryPro — Smart Business Management",
    template: "%s | InventoryPro",
  },
  description:
    "Enterprise-grade inventory management, POS billing, CRM, and analytics platform for modern businesses. Manage everything from one place.",
  keywords: [
    "inventory management", "POS software", "billing software", "GST billing",
    "business management", "SaaS", "India", "multi-tenant",
  ],
  authors: [{ name: "InventoryPro" }],
  creator: "InventoryPro",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "InventoryPro — Smart Business Management",
    description: "Enterprise-grade inventory, POS, CRM, and analytics for modern businesses.",
    siteName: "InventoryPro",
  },
  twitter: {
    card: "summary_large_image",
    title: "InventoryPro",
    description: "Enterprise-grade inventory and business management platform.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              expand={false}
              duration={4000}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
