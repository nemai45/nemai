import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { signOut } from "@/action/auth";

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-purple-100 py-3 px-6 flex items-center justify-between">
        <SidebarTrigger/>
      <div className="flex items-center justify-end w-full gap-4">
        <Button className="unicorn-button" onClick={signOut}>
          Logout
        </Button>
      </div>
    </header>
  );
}
