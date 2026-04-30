'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Package2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NavUser } from '@/components/nav-user';
import type { RoleSidebar, SidebarItem } from '@/config/sidebar.config';

function cleanPath(href = '') {
  return href.split('?')[0];
}

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  const cleanHref = cleanPath(href);
  if (cleanHref === '/') return pathname === '/';
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function isGroupActive(pathname: string, item: SidebarItem) {
  return isActive(pathname, item.href) || Boolean(item.children?.some((child) => isActive(pathname, child.href)));
}

export function AppSidebar({ user, city, navMain, ...props }: { user: any; city?: string; navMain: RoleSidebar }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">Pearl Detergent DWMS</div>
            <div className="truncate text-xs text-muted-foreground">{city ?? 'Head Office'}</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2 py-2 text-xs font-medium uppercase text-muted-foreground">{navMain.title}</div>
        <div className="space-y-3 px-2 pb-4">
          {navMain.sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </div>

              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isGroupActive(pathname, item);

                  if (item.children?.length) {
                    return (
                      <Collapsible key={`${section.title}-${item.label}`} asChild defaultOpen={active} className="group/collapsible">
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.label} isActive={active}>
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={`${item.label}-${child.href}`}>
                                  <SidebarMenuSubButton asChild isActive={isActive(pathname, child.href)}>
                                    <Link href={child.href}>
                                      <span>{child.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem key={`${section.title}-${item.href ?? item.label}`}>
                      <SidebarMenuButton asChild tooltip={item.label} isActive={active}>
                        <Link href={item.href ?? '#'}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
