import { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'Login | PMS ',
  description: 'Sign in to your account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
    
  );
}