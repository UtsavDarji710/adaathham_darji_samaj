import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileAppInstallBanner from "@/components/MobileAppInstallBanner";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

const notoSansGujarati = Noto_Sans_Gujarati({
  subsets: ["gujarati", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-gujarati",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ADSS — શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા",
  applicationName: "ADSS",
  description: "ADSS — અડાઆઠમ દરજી સમાજનું આધિકારિક ડિજિટલ પોર્ટલ — પરિવાર વૃક્ષ, સભ્યો, વ્યવસાય ડિરેક્ટરી, જાહેરાતો, કાર્યક્રમો, દાતાઓ અને એડમિન ડેશબોર્ડ.",
  keywords: ["ADSS", "અડાઆઠમ દરજી સમાજ", "દરજી સમાજ", "મોડાસા", "પરિવાર વૃક્ષ", "ગુજરાતી સમાજ", "Darji Samaj"],
  manifest: "/manifest.json",
  themeColor: "#c2410c",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ADSS",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="gu" className={notoSansGujarati.variable}>
      <body className="min-h-screen bg-ivory-100 text-charcoal-900 font-gujarati flex flex-col selection:bg-saffron-100 selection:text-saffron-800">
        <AuthProvider>
          <DataProvider>
            <Header />
            <main className="flex-1 pb-16">{children}</main>
            <Footer />
            <MobileAppInstallBanner />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
