import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { UserProvider } from "./context/UserContext";

export const metadata = {
  title: "Tech Media Fest 2025",
  description: "Tech Media Fest 2025 and Model United Nations 2025",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="transition-colors duration-300">
        <Navbar />
        <UserProvider>
        {children}
        </UserProvider>
        <Footer />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
