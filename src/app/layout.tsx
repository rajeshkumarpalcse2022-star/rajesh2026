import type { Metadata, Viewport } from "next";
import { Geist, Great_Vibes, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

const uiFont = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const scriptFont = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
  display: "swap",
});

const bengaliFont = Noto_Serif_Bengali({
  weight: ["400", "600"],
  variable: "--font-noto-bengali",
  subsets: ["bengali", "latin"],
  display: "swap",
});

const SITE_TITLE = "Bijoya — A Cinematic Sharodiya Experience";
const SITE_DESCRIPTION =
  "A cinematic Bijoya Dashami greeting — open the card, feel the dhak, and scroll through Sindoor Khela, Dhunuchi Naach, mishti and a heartfelt শুভ বিজয়া দশমী.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_IN",
    siteName: "Bijoya",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#171827",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${uiFont.variable} ${scriptFont.variable} ${bengaliFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
