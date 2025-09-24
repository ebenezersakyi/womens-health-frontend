import { Jost } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "PinkyTrust - Women's Health Companion",
  description: "Your personalized women's health companion for breast cancer prevention, early detection, and overall wellness management.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${jost.variable} antialiased bg-gray-50 min-h-screen font-jost`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
