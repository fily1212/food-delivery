import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation/navbar";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ordina",
  description: "App per ordinare cibo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

          <main className="min-h-screen ">
              <Navbar />
              <div className="flex">
                  <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
                      <div className="mx-auto w-full max-w-5xl">
                          {children}
                      </div>
                  </section>
              </div>
          </main>
      </body>
    </html>
  );
}
