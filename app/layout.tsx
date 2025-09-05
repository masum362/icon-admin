import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TanstackProvider from "@/utils/queryProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IconAdmission Admin",
  description: "Admin Panel for IconAdmission",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="group"
      data-sidebar-size="lg"
      data-card-style="square"
    >
      <body>
        <TanstackProvider>
          {children}
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </TanstackProvider>
      </body>
    </html>
  );
}
