import '@fontsource-variable/inter';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: {
    default: 'CivicAI — Smart Civic Response',
    template: '%s · CivicAI',
  },
  description:
    'CivicAI is an AI-powered civic reporting platform. Report problems using voice, text, images and location — AI understands, verifies, prioritizes and routes civic complaints.',
  keywords: ['civic', 'grievance', 'AI', 'municipal', 'smart city', 'report issue', 'CivicAI'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0c1f45',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex min-h-screen flex-col bg-white text-slate-900 antialiased">
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
