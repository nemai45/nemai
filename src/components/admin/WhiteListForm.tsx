"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { whiteListUser } from "@/action/admin";
import { toast } from "sonner";

export function WhitelistForm() {

  const handleWhitelist = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const role = formData.get("role") as "artist" | "admin";
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    const { error } = await whiteListUser(email, role);

    if (error) {
      toast.error("Error whitelisting user!!", {
        description: error,
      });
      return;
    }

    toast("Artist whitelisted", {
      description: `${email} has been added to the whitelist`,
    });
  };

  return (
    <form action={handleWhitelist} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="email"
          name="email"
          placeholder="Enter email to whitelist"
          className="flex-1"
        />
        <Select name="role" defaultValue="artist">  
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="artist">Artist</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button className="unicorn-button">
          Whitelist
        </Button>
      </div>
    </form>
  );
}
