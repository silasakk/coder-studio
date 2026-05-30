import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Coder Studio - แพลตฟอร์มเกมเขียนโค้ดและดีไซน์ซิสเต็ม",
  description: "แพลตฟอร์มเรียนรู้การเขียนโค้ดผ่านเกมแสนสนุกสไตล์ Duolingo ขับเคลื่อนด้วย Atlassian Blue และฟอนต์ภาษาไทยสารบัญ (Sarabun)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
