'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/stores';
import { AppSidebar } from '@/components/app-sidebar';
import { filterSidebarByPermissions, getSidebarForRole } from '@/config/sidebar.config';

export default function SidebarContainer() {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return null;

  const roleSidebar = getSidebarForRole(user.role);
  const navMain = filterSidebarByPermissions(roleSidebar, user.permissions ?? []);

  return <AppSidebar user={user} city={user.branch_name ?? 'Head Office'} navMain={navMain} />;
}
