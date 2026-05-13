import type { Metadata } from "next";
import "../index.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "PresentIQ - AI Speech Coach",
  description: "AI-Powered Speech Analysis & Voice Recording Platform",
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
