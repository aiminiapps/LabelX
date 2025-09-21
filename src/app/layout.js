import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "LabelX | AI-Powered Data Labeling Agent – $LBLX",
  description:
    "LabelX ($LBLX) is an AI-powered data labeling and validation platform. It automates labeling tasks, enhances data accuracy with human-in-the-loop validation, and enables seamless team collaboration.",
  keywords:
    "LabelX, LBLX, AI labeling, data labeling, annotation, AI validation, human-in-the-loop, collaborative labeling, machine learning data, Web3 AI agent",
  authors: [{ name: "LabelX" }],
  creator: "LabelX AI",
  publisher: "LabelX Labs",
  robots: "index, follow",
  openGraph: {
    title: "LabelX | AI-Powered Data Labeling Agent – $LBLX",
    description:
      "LabelX ($LBLX) automates labeling tasks with AI agents, boosts data accuracy through validation, and empowers teams to collaborate on high-quality datasets.",
    url: "https://labelx.vercel.app/",
    siteName: "LabelX – $LBLX",
    type: "website",
    images: [
      {
        url: "/og-labelx.png",
        width: 1200,
        height: 630,
        alt: "LabelX – AI Data Labeling Agent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LabelX | AI-Powered Data Labeling Agent – $LBLX",
    description:
      "LabelX ($LBLX) brings AI automation + human validation together for next-gen data labeling and collaboration.",
    creator: "@LabelX_AI",
    images: ["/og-labelx.png"],
  },
  viewport:
    "width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover",
  category: "AI Data Labeling",
  classification:
    "AI Labeling Agent, Data Annotation, Machine Learning, Collaborative AI, Human-in-the-Loop",
  other: {
    "application-name": "LabelX AI",
    "mobile-web-app-capable": "yes",
    "mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
  },
  icons: {
    icon: "/agent/agentlogo.png",
    shortcut: "/agent/agentlogo.png",
    apple: "/agent/agentlogo.png",
  },
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#0D0D0F] flex flex-col font-[Space_Grotesk]">
        {children}
      </body>
    </html>
  );
}
