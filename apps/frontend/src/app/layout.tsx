import type { Metadata } from "next";
import { Alumni_Sans } from "next/font/google";
import "./globals.css";

const alumniSans = Alumni_Sans({
  variable: "--font-alumni-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Evently",
  description: "Платформа для бронирования мест на мероприятия",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body
        className={`${alumniSans.variable} font-(family-name:--font-alumni-sans) antialiased flex flex-col h-full`}
      >
        {children}
      </body>
    </html>
  );
}
