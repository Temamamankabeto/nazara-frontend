'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/stores';
import RoleBasedDashboard from '@/components/dwms/final-dashboards';

export default function Page() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);
  if (!user) return <div className="flex h-screen items-center justify-center text-lg text-muted-foreground">Redirecting...</div>;
  return <RoleBasedDashboard />;
}
