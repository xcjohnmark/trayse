import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const urbanist = localFont({
  src: [
    {
      path: "../public/assets/fonts/Urbanist_TTF/Urbanist-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Urbanist_TTF/Urbanist-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Urbanist_TTF/Urbanist-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Urbanist_TTF/Urbanist-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Urbanist_TTF/Urbanist-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-urbanist",
  display: "swap",
});

const newBlack = localFont({
  src: [
    {
      path: "../public/assets/fonts/NewBlack_TTF/NewBlackTypeface-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/NewBlack_TTF/NewBlackTypeface-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/NewBlack_TTF/NewBlackTypeface-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/NewBlack_TTF/NewBlackTypeface-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-newblack",
  display: "swap",
});

const raleway = localFont({
  src: [
    {
      path: "../public/assets/fonts/Raleway_TTF/Raleway-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Raleway_TTF/Raleway-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Raleway_TTF/Raleway-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Raleway_TTF/Raleway-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trayse — Prediction Intelligence That Works For You",
  description:
    "Institutional intelligence, normalized odds, and automated cross-venue arbitrage across Polymarket, Kalshi, and Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${urbanist.variable} ${newBlack.variable} ${raleway.variable} font-sans min-h-screen bg-[#111113] text-white antialiased selection:bg-[#00D688] selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
