"use client"

import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, Search, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="-ml-1" />
        <div className="relative hidden max-w-md w-full md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students, faculty, or research..."
            className="w-full bg-muted/50 pl-9 focus:bg-background"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-accent"></span>
        </Button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium leading-none">Admin User</p>
            <p className="text-xs text-muted-foreground">ccs_admin@university.edu</p>
          </div>
          <Avatar className="h-9 w-9 ring-2 ring-primary/10">
            <AvatarImage src="https://picsum.photos/seed/admin/100" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}