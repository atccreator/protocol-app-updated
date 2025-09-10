// app/(auth)/login/page.tsx
'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isLoading && isAuthenticated) {
  //     router.push('/dashboard');
  //   }
  // }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <LoginForm />;
}