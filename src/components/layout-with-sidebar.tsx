"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

interface LayoutWithSidebarProps {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function LayoutWithSidebar({ children, user }: LayoutWithSidebarProps) {
  return (
    <div className="flex h-screen bg-gray-50/30">
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
