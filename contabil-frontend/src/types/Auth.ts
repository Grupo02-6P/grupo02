export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginScreenProps {
  onLogin: () => void;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  company_id: number;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}


export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_name?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  token_type: string;
  expires_in: number;
}