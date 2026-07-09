import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mindstudioapps.com"),
  title: "Mind Studio — Apps by Ming",
  description:
    "Mind Studio is a one-person app workshop. Small, honest apps for iPhone — M Budget, M Alpha Relax, M Card Wallet, M Double Camera, HelloSecret — each designed, built and polished by the same pair of hands.",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Mind Studio — Apps by Ming",
    description: "One maker. A family of apps. Small, honest apps for iPhone.",
    url: "https://mindstudioapps.com",
    siteName: "Mind Studio",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
