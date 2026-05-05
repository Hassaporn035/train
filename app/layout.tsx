import type { Metadata } from "next";
import { Kanit, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import LayoutWithNav from "./components/LayoutWithNav";
import { Toaster } from "react-hot-toast";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Triann — เส้นทางธนบุรี สายน้ำตก",
  description:
    "แนะนำสถานีและสถานที่ท่องเที่ยวระหว่างธนบุรีถึงน้ำตก รถไฟสายมรณะ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Client Component wrapper for pathname
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${kanit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="top-right" />
        <LayoutWithNav>{children}</LayoutWithNav>
      </body>
    </html>
  );
}

// (moved to app/components/LayoutWithNav.tsx)
