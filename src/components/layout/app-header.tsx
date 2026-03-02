
"use client"

import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, Search, LogOut, LogIn, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/firebase"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export function AppHeader() {
  const { user, profile, loading } = useUserProfile()
  const auth = useAuth()
  const { toast } = useToast()

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      toast({ title: "Welcome!", description: "Successfully signed in." })
    } catch (error: any) {
      toast({ 
        title: "Login Failed", 
        description: error.message, 
        variant: "destructive" 
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({ title: "Signed Out", description: "You have been signed out." })
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" })
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="-ml-1" />
        <div className="relative hidden max-w-md w-full md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="w-full bg-muted/50 pl-9 focus:bg-background"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {profile && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold">
            <ShieldCheck className="h-3 w-3" />
            <span className="capitalize">{profile.role}</span>
          </div>
        )}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-accent"></span>
        </Button>
        <div className="flex items-center gap-3 border-l pl-4">
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                      <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100`} />
                      <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={handleLogin} className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  )
}
