import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hinza — QA complaint management",
  description:
    "Hinza is your QA team's superpower — catching complaints before they become catastrophes.",
  icons: {
    icon: [{ url: "/images/favicon_hinzaa.png", type: "image/png" }],
    apple: [{ url: "/images/favicon_hinzaa.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
