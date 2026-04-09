import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UTM Builder - UTM 파라미터 관리 시스템",
  description: "UTM 파라미터를 쉽게 생성하고 관리하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
