import './globals.css';

export const metadata = {
  title: 'NGP VAN Contact Viewer',
  description: 'View contact information from NGP VAN',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 