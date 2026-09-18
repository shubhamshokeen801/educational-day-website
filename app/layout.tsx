import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "TechMedia Fest by BVICAM",
  description: "TechMedia Fest by BVICAM — celebrating technology, innovation, and media.",
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
        {children}
        <Footer />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}