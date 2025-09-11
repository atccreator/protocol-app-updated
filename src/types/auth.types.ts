export enum UserRole {
  ADMIN = 'admin',
  PROTOCOL_OFFICER = 'protocol_officer',
  PROTOCOL_INCHARGE = 'protocol_incharge',
  REQUESTEE = 'requestee'
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  user_type?: UserRole | undefined;
}