'use client';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  IAuthState,
  ILoginRequest,
} from '@/modules/shared/domain/types/auth.types';

export const useAuthStore = create<IAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login user
       */
      login: async (credentials: ILoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            set({
              user: result.data.user,
              token: result.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            toast.success('¡Bienvenido de vuelta!');

            // Redirect to dashboard
            window.location.href = '/crm';
          } else {
            const errorMessage = result.message || 'Error de autenticación';
            set({
              error: errorMessage,
              isLoading: false,
            });
            toast.error(errorMessage);
          }
        } catch (error) {
          const errorMessage = 'Error de conexión. Intente nuevamente.';
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
        }
      },

      /**
       * Logout user
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        toast.info('Sesión cerrada correctamente');
        window.location.href = '/crm/login';
      },

      /**
       * Clear error
       */
      clearError: () => set({ error: null }),

      /**
       * Initialize auth state
       */
      initAuth: () => {
        const { token } = get();
        if (token) {
          // Verify token is still valid
          // This could be expanded to make an API call
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
