import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const themeBootstrapScript = `
(() => {
  try {
    const modeKey = "intelliviz-theme";
    const presetKey = "intelliviz-theme-preset";
    const mode = localStorage.getItem(modeKey);
    const preset = localStorage.getItem(presetKey);
    const root = document.documentElement;

    const resolvedMode = mode === "light" || mode === "dark" ? mode : "dark";
    root.classList.toggle("dark", resolvedMode === "dark");
    root.style.colorScheme = resolvedMode;

    if (typeof preset === "string" && preset.length > 0) {
      root.dataset.theme = preset;
    } else {
      root.dataset.theme = resolvedMode === "dark" ? "dark-control" : "light-industrial";
    }
  } catch (_) {
    // Ignore storage access issues and keep default theme.
  }
})();
`;

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: 'NEXUS AI - Industrial Monitoring Platform',
  description: 'AI-powered Industrial Monitoring & Intelligence Platform with predictive maintenance, cybersecurity, and real-time analytics',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground selection:bg-primary/20 selection:text-foreground`}>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrapScript}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
