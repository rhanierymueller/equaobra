import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupportChat } from "@/src/components/SupportChat";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EquaObra — Monte equipes para sua obra",
  description: "A plataforma que conecta contratantes a profissionais verificados para obras de pequeno a grande porte.",
  icons: {
    icon: '/icon_equaobra.png',
    apple: '/icon_equaobra.png',
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
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
