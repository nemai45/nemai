import { SidebarLayout, SidebarMenuItemType } from '@/components/Sidebar';
import { createClient } from '@/utils/supabase/server';
import React from 'react'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/get-user-role';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryProvider } from '@/components/QueryProvider';

const layout = async ({
  children,
  params,
}: {
  children: React.ReactNode,
  params: Promise<{ id: string }>,
}) => {
  const { id } = await params
  const artistMenuItems: SidebarMenuItemType[] = [
    { title: "Bookings", path: `/artist/${id}`, icon: "Calendar" },
    { title: "Services", path: `/artist/${id}/services`, icon: "ShoppingBag" },
    { title: "Portfolio", path: `/artist/${id}/portfolio`, icon: "Image" },
    { title: "Availability", path: `/artist/${id}/availability`, icon: "Clock" },
    { title: "Profile", path: `/artist/${id}/profile`, icon: "UserCircle" },
  ];
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    return <div>Error: {error.message}</div>
  }
  if (!user) {
    redirect("/login")
  }
  const role = await getUserRole()
  if (role !== "admin") {
    redirect("/")
  }
  return (
    <div>
      <QueryProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="min-h-screen flex w-full">
            <SidebarLayout menuItems={artistMenuItems} />
            <div className="flex-1 flex flex-col">
              <DashboardHeader />
              <main className="flex-1 p-6 overflow-y-auto bg-purple-50/30">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </QueryProvider>
    </div>
  )
}

export default layout