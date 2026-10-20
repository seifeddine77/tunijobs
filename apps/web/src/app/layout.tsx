import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TuniJobs — Premier Portail d\'Emploi IA & Cartographie en Tunisie',
  description:
    'Trouvez votre prochain emploi en Tunisie parmi les offres géolocalisées sur les 24 gouvernorats. Recommandations personnalisées par IA et matching de compétences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
