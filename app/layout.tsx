import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediChannel - Online Medical Appointment Booking",
  description: "Book medical appointments with top doctors and specialists in Sri Lanka",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
        <body className={`${inter.className} antialiased`}>
          {children}
          <Toaster />
        </body>
    </html>
  );
}