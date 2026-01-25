import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "Learning JEE",
  description: "An environment for dumbasses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
