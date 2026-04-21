import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ToysMomento — Custom Figure untuk Momen Berharga",
  description:
    "ToysMomento mengabadikan momen berharga Anda dalam bentuk custom figure berkualitas tinggi. Pesan sekarang dan jadikan kenangan Anda abadi.",
  keywords: [
    "custom figure",
    "toysmomento",
    "chibi figure",
    "nendoroid custom",
    "hadiah unik",
  ],
  openGraph: {
    title: "ToysMomento — Custom Figure untuk Momen Berharga",
    description:
      "ToysMomento mengabadikan momen berharga Anda dalam bentuk custom figure berkualitas tinggi.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-white text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
