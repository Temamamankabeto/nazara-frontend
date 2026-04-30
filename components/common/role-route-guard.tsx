'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores';
import { canAccessPath, getPrimaryRole, getRoleHome } from '@/lib/role-access';

export default function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = getPrimaryRole(user);

  useEffect(() => {
    if (!user) return;
    if (!canAccessPath(role, pathname)) {
      router.replace(getRoleHome(role));
    }
  }, [pathname, role, router, user]);

  if (user && !canAccessPath(role, pathname)) return null;
  return <>{children}</>;
}
