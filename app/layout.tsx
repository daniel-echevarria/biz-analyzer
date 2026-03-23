import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataReady — AI Data Pipeline",
  description: "Turn messy web data into AI-ready structured data. Paste any business URL and get clean, structured JSON instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
