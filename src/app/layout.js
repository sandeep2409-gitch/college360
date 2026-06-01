import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'College 360 — Campus Intelligence Platform',
  description: 'An AI-powered campus management system with attendance tracking, resource sharing, event management, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
