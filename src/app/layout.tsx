import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Navbar } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { ThemeProvider, themeScript } from "@/context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased transition-colors duration-300`}
      >
        {/* Prevent flash of wrong theme - runs before React hydration */}
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for theme script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <ThemeProvider defaultTheme="system" enableSystem>
          <ToastProvider position="bottom-right" showProgress pauseOnHover>
            <Navbar />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
