import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Predicción Febril Pediátrica | UniSinú',
  description: 'Sistema de predicción de severidad febril en pacientes pediátricos - Universidad del Sinú, Cartagena',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
