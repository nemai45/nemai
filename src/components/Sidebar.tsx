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
  SidebarMenuItem,
  useSidebar
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
  Home,
  Search,
  BadgeInfo,
  Bell
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
  Home,
  Search,
  BadgeInfo,
  Bell
};

export interface SidebarMenuItemType {
  title: string;
  path: string;
  icon: keyof typeof iconMap;
}


export interface SidebarLayoutProps {
  title?: string;
  menuItems: SidebarMenuItemType[];
  unReadNotifications?: number;
}

export function SidebarLayout({
  title = "Némai",
  menuItems,
  unReadNotifications,
}: SidebarLayoutProps) {
  const location = usePathname();
  const router = useRouter();
  const isActive = (itemPath: string) =>
    location === itemPath ;
  const { setOpen, open, openMobile, setOpenMobile, isMobile } = useSidebar();
  return (
    <Sidebar className="border-r border-purple-100">
      <SidebarContent>
        <div className="flex items-center px-4 py-6">
          <span onClick={() => router.push("/")} className="text-xl font-bold bg-gradient-to-r from-unicorn-purple to-unicorn-pink text-transparent bg-clip-text">
            {title}
          </span>
        </div>
        <div className="flex flex-col justify-between h-full gap-4">
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
                        onClick={() => {
                          if (isMobile) {
                            setOpenMobile(!openMobile);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                          isActive(item.path)
                            ? "bg-purple-100 text-purple-700"
                            : "hover:bg-purple-50"
                        )}
                      >

                        {IconComponent && <IconComponent className="w-5 h-5" />}
                        <span>{item.title}</span>
                        {item.path === "/artist-dashboard/notifications" && unReadNotifications && unReadNotifications > 0 && (
                          <span className="text-xs text-red-500">{unReadNotifications}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Link href={"/terms-and-conditions"} className="flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-purple-50">
                <FileText className="w-5 h-5" />
                <span>Terms and Conditions</span>
              </Link>
              <Link href={"/about-us"} className="flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-purple-50">
                <BadgeInfo className="w-5 h-5" />
                <span>About Us</span>
              </Link>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
