import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DNAU | Mobile Cryptocurrency Assistant",
  description: "DNAU - Your is cryptocurrency and blockchain assistant. Get expert insights on Bitcoin, Ethereum, DeFi, trading strategies, and blockchain technology on-the-go.",
  keywords: "cryptocurrency, bitcoin, ethereum, blockchain, DeFi, crypto trading, mobile AI assistant, DNAU, crypto analysis, digital assets, mobile crypto",
  authors: [{ name: "DNAU" }],
  creator: "DNAU",
  publisher: "DNAU",
  robots: "index, follow",
  openGraph: {
    title: "DNAU | Mobile Cryptocurrency Assistant",
    description: "Expert AI-powered cryptocurrency insights and blockchain guidance. Trade smarter with CryptoBot AI on mobile.",
    url: "https://dnauapp.vercel.app/",
    siteName: "DNAU CryptoBot",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "DNAU | Mobile Cryptocurrency Assistant",
    description: "Expert AI-powered cryptocurrency insights and blockchain guidance on mobile.",
    creator: "@DNAU_AI"
  },
  viewport: "width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover",
  category: "cryptocurrency",
  classification: "Mobile AI Assistant, Cryptocurrency, Blockchain",
  other: {
    "application-name": "CryptoBot AI",
    "mobile-web-app-capable": "yes",
    "mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#1a1a2e] flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
