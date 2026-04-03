"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, Search, LogOut, LogIn, ShieldCheck, UserPlus, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/firebase"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import Image from "next/image"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from "firebase/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CCS_LOGO = "https://i.imgur.com/c2ywZT7.png"

export function AppHeader() {
  const router = useRouter()
  const { user, profile, loading: profileLoading } = useUserProfile()
  const auth = useAuth()
  const { toast } = useToast()
  
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")

  const [notifications, setNotifications] = useState([
    { id: 1, title: "System Maintenance", description: "Scheduled maintenance on Sunday at 2:00 AM.", time: "2h ago", type: "info", read: false },
    { id: 2, title: "New Research Paper", description: "A new study on AI in Agriculture has been published.", time: "5h ago", type: "success", read: false },
    { id: 3, title: "Midterm Schedule", description: "The midterm examination schedule is now available.", time: "1d ago", type: "warning", read: true },
  ])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const markNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({ title: "Welcome back!", description: "Successfully signed in." })
      setIsAuthOpen(false)
      router.push("/")
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName })
      toast({ title: "Account Created", description: "Welcome to CCS-CPS!" })
      setIsAuthOpen(false)
      router.push("/")
    } catch (error: any) {
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({ title: "Signed Out", description: "You have been signed out." })
      router.push("/login")
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" })
    }
  }

  const profileImage = `/images/suit-${profile?.role || 'student'}.png`

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="-ml-1" />
        <div className="relative hidden max-w-md w-full md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search CCS resources..."
            className="w-full bg-muted/50 pl-9 focus:bg-background"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {profile && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <ShieldCheck className="h-3 w-3" />
            <span className="capitalize">{profile.role}</span>
          </div>
        )}
        
        <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>Latest updates for your profile.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex items-center justify-end gap-2 border-b pb-4">
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>Mark all read</Button>
              <Button variant="ghost" size="sm" onClick={clearNotifications} disabled={notifications.length === 0}>Clear all</Button>
            </div>
            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No notifications.
                </div>
              ) : notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all hover:bg-muted/10 ${n.read ? "bg-background" : "bg-muted/10"}`}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      n.type === 'success' ? 'bg-green-500' :
                      n.type === 'warning' ? 'bg-orange-500' : 'bg-primary'
                    } ${n.read ? 'opacity-40' : ''}`} />
                    <div className="space-y-1">
                      <p className={`text-sm ${n.read ? "font-medium" : "font-semibold"}`}>{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/50">{n.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-3 border-l pl-4">
          {!profileLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                      <AvatarImage src={profileImage} alt="Profile" />
                      <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px]">
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login" className="space-y-4 pt-4">
                      <DialogHeader className="flex flex-col items-center">
                        <Image 
                          src={CCS_LOGO} 
                          alt="CCS Logo" 
                          width={60} 
                          height={60} 
                          className="mb-2"
                          unoptimized
                        />
                        <DialogTitle>CCS-CPS Portal</DialogTitle>
                        <DialogDescription>
                          College of Computer Studies Portal
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="m@ccs.edu.ph" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full" disabled={authLoading}>
                          {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                          Sign In
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4 pt-4">
                      <DialogHeader className="flex flex-col items-center">
                        <Image 
                          src={CCS_LOGO} 
                          alt="CCS Logo" 
                          width={60} 
                          height={60} 
                          className="mb-2"
                          unoptimized
                        />
                        <DialogTitle>Create Account</DialogTitle>
                        <DialogDescription>
                          Register for the CCS Profiling System.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Full Name</Label>
                          <Input id="signup-name" placeholder="Mikha Lim" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input id="signup-email" type="email" placeholder="m@ccs.edu.ph" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input id="signup-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full" disabled={authLoading}>
                          {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                          Create Account
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )
          )}
        </div>
      </div>
    </header>
  )
}
