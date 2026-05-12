import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CAD - Computer Aided Design',
  description: 'A CAD application built with Next.js, Three.js, and Manifold-3D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}