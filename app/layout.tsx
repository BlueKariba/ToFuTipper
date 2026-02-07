import type { Metadata } from "next";
import { Barlow, Teko } from "next/font/google";
import "./globals.css";

const displayFont = Teko({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

const bodyFont = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Tobis Superbowl Tippspiel",
  description:
    "Tobis Superbowl Tippspiel – Patriots-themed Tippspiel für den Super Bowl LX.",
  openGraph: {
    title: "Tobis Superbowl Tippspiel",
    description:
      "Tobis Superbowl Tippspiel – Patriots-themed Tippspiel für den Super Bowl LX.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
