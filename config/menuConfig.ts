// Backward-compatible exports. New code should import from config/sidebar.config.ts.
import type { RoleSidebar } from './sidebar.config';
import { adminSidebar, allSidebarItems, filterSidebarByPermissions, getSidebarForRole, roleSidebars } from './sidebar.config';

export type DwmsMenuItem = (typeof allSidebarItems)[number];
export type DwmsMenuSection = RoleSidebar;

export const allDwmsMenuItems = allSidebarItems;
export const fallbackMenu = adminSidebar;
export const menuConfig = roleSidebars;

export function filterMenuByPermissions(menu: RoleSidebar, permissions: string[]) {
  return filterSidebarByPermissions(menu, permissions);
}

export { getSidebarForRole };
