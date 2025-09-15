// Fixed contexts/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, LoginCredentials, RegisterData } from '@/types/auth.types';
import { authApi, handleApiError } from '@/lib/api';
import { useRouter,usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize authentication state
  useEffect(() => {
    if (isInitialized) return; // Prevent multiple initializations
      if (['/login', '/register', '/'].includes(pathname)) {
    setIsLoading(false);
    setIsInitialized(true);
    setUser(null);
    return;
  }
    const initAuth = async () => {
      try {
        setIsLoading(true);
        // Try to get current user (token is in httpOnly cookie)
        const response = await authApi.getCurrentUser();
        setUser(response.data.data);
      } catch (error: any) {
        console.log('Initial auth check failed, trying refresh...');
        
        // Token might be expired, try refresh
        try {
          await authApi.refreshToken();
          const userResponse = await authApi.getCurrentUser();
          setUser(userResponse.data.data);
        } catch (refreshError) {
          console.log('Both auth and refresh failed - user needs to login');
          setUser(null);
          // Don't redirect here - let the route protection handle it
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [isInitialized,pathname]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const response = await authApi.login(credentials);
      const { user: userData } = response.data.data;
      
      setUser(userData);
      
      toast("Welcome back!", {
        description: `Logged in as ${userData.username}`,
      });

      // Role-based redirect
      switch (userData.user_type) {
        case UserRole.ADMIN:
          router.push('/admin');
          break;
        case UserRole.PROTOCOL_OFFICER:
          router.push('/protocol-officer');
          break;
        case UserRole.PROTOCOL_INCHARGE:
          router.push('/protocol-incharge');
          break;
        case UserRole.REQUESTEE:
          router.push('/requestee');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast.error("Login failed", {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      const { confirmPassword, ...registerData } = data;
      
      // Additional validation
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await authApi.register(registerData);
      const { user: userData } = response.data.data;
      
      setUser(userData);
      
      toast("Registration successful!", {
        description: "Welcome to the platform",
      });

      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast.error("Registration failed", {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authApi.logout(); // Call backend to clear httpOnly cookies
      setUser(null);
      
      toast("Logged out", {
        description: "You have been successfully logged out",
      });
      
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken();

      // if(!response.data.data.user){
      //   console.log("No user found")
      // }
      // If refresh returns user data, update it
      if (response.data?.data?.user) {
        setUser(response.data.data.user);
      }
      // Token is refreshed in httpOnly cookie by backend
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
      throw error;
    }
  };

  const hasRole = useCallback((roles: UserRole | UserRole[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.user_type);
  }, [user]);

  const canAccess = useCallback((requiredRoles: UserRole[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.user_type);
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    hasRole,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// RBAC Hook
export const useRBAC = () => {
  const { user, hasRole, canAccess } = useAuth();
  
  const isAdmin = hasRole(UserRole.ADMIN);
  const isProtocolOfficer = hasRole(UserRole.PROTOCOL_OFFICER);
  const isProtocolIncharge = hasRole(UserRole.PROTOCOL_INCHARGE);
  const isRequestee = hasRole(UserRole.REQUESTEE);
  
  const canManageUsers = hasRole([UserRole.ADMIN]);
  const canManageProtocols = hasRole([
    UserRole.ADMIN,
    UserRole.PROTOCOL_INCHARGE,
    UserRole.PROTOCOL_OFFICER
  ]);
  
  return {
    user,
    isAdmin,
    isProtocolOfficer,
    isProtocolIncharge,
    isRequestee,
    canManageUsers,
    canManageProtocols,
    hasRole,
    canAccess,
  };
};