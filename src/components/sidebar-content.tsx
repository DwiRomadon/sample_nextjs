"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface SidebarContentProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void; // For mobile close on navigation
}

interface MenuItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  role?: string[];
}

const menuItems: MenuItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    role: ["USER", "ADMIN"],
  },
  {
    href: "/profile",
    icon: User,
    label: "Profile",
    role: ["USER", "ADMIN"],
  },
  {
    href: "/admin/dashboard",
    icon: Settings,
    label: "Admin Dashboard",
    role: ["ADMIN"],
  },
];

export function SidebarContent({
  user,
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter(
    (item) => !item.role || item.role.includes(user.role)
  );

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Info - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1 capitalize">
                {user.role.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="p-2 border-b border-gray-200 flex justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">
              {user.name?.charAt(0).toUpperCase() ||
                user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleNavigation}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                    "hover:bg-gray-100 hover:text-gray-900",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle - Only for desktop */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-gray-200 hidden lg:block">
          <Button
            variant="ghost"
            onClick={onToggleCollapse}
            className={cn(
              "w-full justify-start text-gray-600 hover:text-gray-900",
              isCollapsed && "justify-center"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-3" />
                Collapse
              </>
            )}
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Keluar"}
        </Button>
      </div>
    </div>
  );
}
