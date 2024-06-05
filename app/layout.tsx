import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/app/ui/navigationbar";
import { ProviderContextToaster } from "./ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | ' + process.env.NEXTJS_PUBLIC_PROJECT_NAME,
    default: process.env.NEXTJS_PUBLIC_PROJECT_NAME ?? ''
  },
  description: "Shopping list project using NextJS and ReactJS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)
{
  return (
    <html lang="en">
      <body className={ inter.className }>
        <div className="flex h-screen flex-col">
          <nav className="m-1 pb-1 border-b">
            <NavigationBar />
          </nav>
          <main className="p-2">
            <ProviderContextToaster>
              { children }
            </ProviderContextToaster>
          </main>
        </div>
      </body>
    </html>
  );
}
