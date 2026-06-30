import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModals from "./components/AuthModals";
import { FilterProvider } from "./shared/context/FilterContext";

const siteUrl = process.env.APP_URL ?? "http://localhost:3000";
const siteName = "Rugby na TV";
const siteDescription =
  "Descubra onde e quando assistir aos jogos de rugby no Brasil. Transmissões, competições e horários reunidos em um só lugar.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Onde assistir rugby no Brasil`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "rugby",
    "rugby na TV",
    "transmissões de rugby",
    "onde assistir rugby",
    "jogos de rugby",
    "rugby no Brasil",
    "rugby ao vivo",
    "Super Rugby",
    "Six Nations",
    "Rugby Championship",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: { canonical: "/" },
  icons: { icon: "/icon.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName,
    title: `${siteName} - Onde assistir rugby no Brasil`,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Onde assistir rugby no Brasil`,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="rugbynatv">
      <body className="antialiased flex flex-col min-h-screen">
        <FilterProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Suspense>
            <AuthModals />
          </Suspense>
        </FilterProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
