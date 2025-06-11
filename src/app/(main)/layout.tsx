import { DashboardHeader } from '@/components/DashboardHeader';
import { QueryProvider } from '@/components/QueryProvider';
import { SidebarLayout, SidebarMenuItemType } from '@/components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getUserRole } from '@/lib/get-user-role';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

const layout = async ({
  children,
  modal,
}: {
  children: React.ReactNode,
  modal: React.ReactNode
}) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const adminMenuItems: SidebarMenuItemType[] = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: "List",
    },
    {
      title: "Orders",
      path: "/admin/orders",
      icon: "FileText",
    },
    {
      title: "Artists",
      path: "/admin/artists",
      icon: "Users",
    },
    {
      title: "Customers",
      path: "/admin/users",
      icon: "User",
    },
    {
      title: "Whitelist",
      path: "/admin/whitelist",
      icon: "Check",
    },
    {
      title: "Appointments",
      path: "/admin/appointments",
      icon: "Calendar",
    }
  ];
  const artistMenuItems: SidebarMenuItemType[] = [
    { title: "Bookings", path: "/artist-dashboard", icon: "Calendar" },
    { title: "Services", path: "/artist-dashboard/services", icon: "ShoppingBag" },
    { title: "Income", path: "/artist-dashboard/income", icon: "BarChart3" },
    { title: "Portfolio", path: "/artist-dashboard/portfolio", icon: "Image" },
    { title: "Availability", path: "/artist-dashboard/availability", icon: "Clock" },
    { title: "Profile", path: "/artist-dashboard/profile", icon: "UserCircle" },
    { title: "History", path: "/artist-dashboard/history", icon: "History" },
    { title: "Preview", path: `/artist-profile/${user.id}`, icon: "Eye" },
  ];

  const customerMenuItems: SidebarMenuItemType[] = [
    { title: "Home", path: "/", icon: "Home" },
    { title: "Explore", path: "/customer-dashboard/", icon: "Search" },
    { title: "Bookings", path: "/customer-dashboard/bookings", icon: "Calendar" },
    { title: "Profile", path: "/customer-dashboard/profile", icon: "UserCircle" },
  ]

  const role = await getUserRole()

  let menuItems: SidebarMenuItemType[] = []
  if (role === "admin") {
    menuItems = adminMenuItems
  } else if (role === "artist") {
    menuItems = artistMenuItems
  } else {
    menuItems = customerMenuItems
  }

  return (
    <QueryProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full">
          <SidebarLayout menuItems={menuItems} />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-6 overflow-y-auto bg-purple-50/30">
              {children}
              {modal}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </QueryProvider>
  )
}

export default layout