import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Quantum UI',
    description: 'Quantum is a collection of modern react components made to be simple, fast, and easy to use.',
    keywords: ['quantum-cli', 'web-components', 'cli', 'components', 'web', 'react', 'ui', 'design', 'system'],
    metadataBase: new URL('https://quantum.zyrenth.dev'),
    openGraph: {
        images: [
            {
                url: '/full_logo.png',
                width: 512,
                height: 512,
                alt: 'Quantum UI Logo',
            },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
    );
}
