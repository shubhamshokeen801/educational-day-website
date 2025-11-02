import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { UserProvider } from "./context/UserContext";

export const metadata = {
  title: "Tech media fest",
  description: "Tech Media Fest 2025 and Education Day 2025",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-black transition-colors duration-300">
        {/* All pages will render inside this */}
        <Navbar />
        <UserProvider>
        {children}
        </UserProvider>
        <Footer />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
