'use client';

import { AuthLayout as SharedAuthLayout } from '@/components/shared/layout/AuthLayout';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return <SharedAuthLayout>{children}</SharedAuthLayout>;
}