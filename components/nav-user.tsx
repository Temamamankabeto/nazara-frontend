'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronsUpDown,
  LogOut,
  ShieldCheck,
  UserCog,
  Users,
  Truck,
  Boxes,
  Warehouse,
  Settings,
} from 'lucide-react';

import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { logoutReduxAction } from '@/stores/slices/userSlice';
import { removeToken } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { useI18n } from '@/i18n';

export function NavUser({ user }: { user: any }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isMobile } = useSidebar();
  const { mutate: logout } = useLogout();
  const { t } = useI18n();

  const roleName = user?.role || user?.roles?.[0]?.name || '';

  const isGeneralAdmin = roleName === 'General Administrator';
  const isSalesOfficer = roleName === 'Sales Officer';

  const getInitials = (name?: string) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  const logoutAction = () => {
    logout(undefined, {
      onSuccess: () => {
        dispatch(logoutReduxAction());
        removeToken();
        router.push('/auth/login');
        toast.success(t('common.loggedOut', 'Logged out successfully'));
      },
      onError: (error: any) => {
        toast.error(error?.message || t('common.logoutFailed', 'Logout failed'));
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user?.avatar || '/default-avatar.png'}
                  alt={user?.name || t('common.user', 'User')}
                />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.name || t('common.user', 'User')}
                </span>
                <span className="truncate text-xs">
                  {roleName || t('common.noRole', 'No role')}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel>
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.name || t('common.user', 'User')}
                  />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {user?.name || t('common.user', 'User')}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user?.email || t('common.noEmail', 'No email')}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account">
                  <BadgeCheck className="mr-2 h-4 w-4" />{t('common.account', 'Account')}</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/notifications">
                  <Bell className="mr-2 h-4 w-4" />{t('common.notifications', 'Notifications')}</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {isSalesOfficer && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs text-muted-foreground">{t('nav.sales', 'Sales')}</DropdownMenuLabel>

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/customers">
                      <Users className="mr-2 h-4 w-4" />{t('nav.customersDistributors', 'Customers / Distributors')}</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}

            {isGeneralAdmin && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs text-muted-foreground">{t('nav.administration', 'Administration')}</DropdownMenuLabel>

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/users">
                      <Users className="mr-2 h-4 w-4" />{t('nav.users', 'Users')}</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/roles-permissions">
                      <UserCog className="mr-2 h-4 w-4" />{t('nav.roles', 'Roles')}</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/roles-permissions?tab=permissions">
                      <ShieldCheck className="mr-2 h-4 w-4" />{t('nav.permissions', 'Permissions')}</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/branches">
                      <Building2 className="mr-2 h-4 w-4" />{t('nav.branches', 'Branches')}</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/suppliers">
                      <Truck className="mr-2 h-4 w-4" />{t('nav.suppliers', 'Suppliers')}</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/products">
                      <Boxes className="mr-2 h-4 w-4" />{t('nav.products', 'Products')}</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/warehouses">
                      <Warehouse className="mr-2 h-4 w-4" />{t('nav.warehouses', 'Warehouses')}</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/audit-logs">
                      <ShieldCheck className="mr-2 h-4 w-4" />{t('nav.auditLogs', 'Audit Logs')}</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />{t('nav.systemSettings', 'System Settings')}</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}

            <LanguageSwitcher />

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logoutAction}>
              <LogOut className="mr-2 h-4 w-4" />{t('common.logout', 'Log out')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}