"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SidebarContent } from "@/components/sidebar-content";

interface MobileSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function MobileSidebar({ user }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Auto-close when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-full p-0 sm:max-w-sm flex flex-col"
        >
          {/* Tambahkan SheetTitle yang tersembunyi untuk accessibility */}
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          {/* Simple header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Menu className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                Dashboard Menu
              </span>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-auto">
            <SidebarContent user={user} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
