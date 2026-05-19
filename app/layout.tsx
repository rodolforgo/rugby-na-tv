import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rugby na TV",
  description: "Transmissões de rugby no Brasil em um só lugar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
