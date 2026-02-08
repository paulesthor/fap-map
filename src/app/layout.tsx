import type { Metadata } from "next";
import { Anton, Epilogue } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/bottom-nav";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
});

export const metadata: Metadata = {
  title: "Fap Map",
  description: "Social Map for Gen Z",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${anton.variable} ${epilogue.variable} antialiased bg-background text-text font-body pb-20`} // Added pb-20 for BottomNav space
      >
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
