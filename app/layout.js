import { Lato } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata = {
  title: "Breast Health Awareness App",
  description: "Find breast cancer screening events and centers near you. Early detection saves lives.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} antialiased bg-gray-50 min-h-screen font-lato`}
      >
        <Header />
        <main className="pt-0">
          {children}
        </main>
        <BottomNavigation />
        <div className="pb-16 md:pb-0"> {/* Add padding for mobile bottom nav */}
        </div>
      </body>
    </html>
  );
}
