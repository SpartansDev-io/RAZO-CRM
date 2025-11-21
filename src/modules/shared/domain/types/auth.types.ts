export interface IRole {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface IUser {
  id: string;
  roleId?: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role?: IRole | string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  user: Omit<IUser, 'passwordHash'>;
  token: string;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: ILoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initAuth: () => void;
}

export interface ResponseWrapper<T> {
  data?: T;
  message: string;
  success: boolean;
  error?: string;
}
