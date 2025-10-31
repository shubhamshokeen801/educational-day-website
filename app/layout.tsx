import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Educational Day",
  description: "Educational Day Website",
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
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
