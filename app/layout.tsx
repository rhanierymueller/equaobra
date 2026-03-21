import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SupportChat } from "@/src/components/SupportChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
