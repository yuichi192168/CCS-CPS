"use client"

import * as React from "react"
import {
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Library,
  Settings,
  Users,
  Wand2,
  UserCircle,
} from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUserProfile } from "@/firebase/auth/use-user-profile"

const CCS_LOGO = "https://i.imgur.com/c2ywZT7.png"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["admin", "faculty", "student"],
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: UserCircle,
    roles: ["admin", "faculty", "student"],
  },
  {
    title: "Students",
    url: "/students",
    icon: GraduationCap,
    roles: ["admin"],
  },
  {
    title: "Faculty",
    url: "/faculty",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Research Repository",
    url: "/research",
    icon: Library,
    roles: ["admin", "faculty", "student"],
  },
  {
    title: "Events & Schedules",
    url: "/events",
    icon: Calendar,
    roles: ["admin", "faculty", "student"],
  },
  {
    title: "Instructional Tools",
    url: "/tools",
    icon: Wand2,
    roles: ["admin", "faculty"],
    children: [
      { title: "Syllabus Generator", url: "/tools/syllabus" },
      { title: "Research Summarizer", url: "/tools/summarizer" },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { profile, loading } = useUserProfile()

  const filteredItems = React.useMemo(() => {
    if (loading) return [];
    if (!profile) return navItems.filter(item => item.url === "/" || item.url === "/research" || item.url === "/events");
    return navItems.filter(item => item.roles.includes(profile.role));
  }, [profile, loading]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-background p-1.5 shadow-sm ring-1 ring-border overflow-hidden">
             <Image 
              src={CCS_LOGO} 
              alt="CCS Logo" 
              width={28} 
              height={28}
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-lg tracking-tight text-primary">CCS-CPS</span>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider leading-none">Pamantasan ng Cabuyao</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 pt-4">
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              {item.children ? (
                <div className="flex flex-col gap-1">
                   <SidebarMenuButton 
                    tooltip={item.title}
                    className={pathname.startsWith(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                  >
                    <item.icon className="size-4" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {item.children.map((child) => (
                      <SidebarMenuSubItem key={child.url}>
                        <SidebarMenuSubButton asChild isActive={pathname === child.url}>
                          <Link href={child.url}>{child.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </div>
              ) : (
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  isActive={pathname === item.url}
                >
                  <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/profile">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
