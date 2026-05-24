import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModals from "./components/AuthModals";
import { FilterProvider } from "./shared/context/FilterContext";

export const metadata: Metadata = {
  title: "Rugby na TV",
  description: "Transmissões de rugby no Brasil em um só lugar",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased flex flex-col min-h-screen">
        <FilterProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Suspense>
            <AuthModals />
          </Suspense>
        </FilterProvider>
      </body>
    </html>
  );
}
