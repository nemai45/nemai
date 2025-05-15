"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";


import {
  List,
  FileText,
  Users,
  User,
  Check,
  Calendar,
  ShoppingBag,
  BarChart3,
  Image,
  Clock,
  UserCircle,
  History,
  Eye,
  Home
} from "lucide-react";

const iconMap = {
  List,
  FileText,
  Users,
  User,
  Check,
  Calendar,
  ShoppingBag,
  BarChart3,
  Image,
  Clock,
  UserCircle,
  History,
  Eye,
  Home
};

export interface SidebarMenuItemType {
  title: string;
  path: string;
  icon: keyof typeof iconMap;
}


export interface SidebarLayoutProps {
  title?: string;
  menuItems: SidebarMenuItemType[];
}

export function SidebarLayout({
  title = "Nemai",
  menuItems,
}: SidebarLayoutProps) {
  const location = usePathname();
  const router = useRouter();
  const isActive = (itemPath: string) =>
    location === itemPath ;

  return (
    <Sidebar className="border-r border-purple-100">
      <SidebarContent>
        <div className="flex items-center px-4 py-6">
          <span onClick={() => router.push("/")} className="text-xl font-bold bg-gradient-to-r from-unicorn-purple to-unicorn-pink text-transparent bg-clip-text">
            {title}
          </span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const IconComponent = iconMap[item.icon];
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                          isActive(item.path)
                            ? "bg-purple-100 text-purple-700"
                            : "hover:bg-purple-50"
                        )}
                      >

                        {IconComponent && <IconComponent className="w-5 h-5" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
