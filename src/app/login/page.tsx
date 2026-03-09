"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Lock, Eye, EyeOff, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const { user, loading: profileLoading } = useUserProfile()
  const { toast } = useToast()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && !profileLoading) {
      router.push("/")
    }
  }, [user, profileLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({ title: "Welcome back!", description: "Successfully signed in." })
      router.push("/")
    } catch (error: any) {
      let message = "Invalid email or password."
      if (error.code === 'auth/operation-not-allowed') {
        message = "Email login is disabled. Please enable it in Firebase Console."
      }
      toast({ 
        title: "Login Failed", 
        description: message, 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (roleEmail: string) => {
    setEmail(roleEmail)
    setPassword(roleEmail.split('@')[0] + "123")
  }

  if (profileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side: PNC Campus Background and Logo */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 z-10 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-white">
          <div className="relative mb-8 h-48 w-48 overflow-hidden rounded-full border-4 border-white/20 bg-white/10 p-4 backdrop-blur-md">
             <div className="flex h-full w-full items-center justify-center rounded-full bg-white/95 p-4 shadow-2xl">
                <Image 
                  src="/images/logo.png" 
                  alt="University of Cabuyao Logo" 
                  width={140} 
                  height={140}
                  className="object-contain"
                  priority
                />
             </div>
          </div>
          <h1 className="text-center font-headline text-5xl font-bold tracking-tight text-white drop-shadow-lg">
            University of Cabuyao
          </h1>
          <p className="mt-4 text-center text-xl font-medium text-white/90 drop-shadow-md">
            Pamantasan ng Cabuyao
          </p>
          <div className="mt-12 flex items-center gap-4 rounded-full bg-black/30 px-6 py-2 backdrop-blur-md">
            <Badge variant="outline" className="border-white/40 text-white">EST. 2003</Badge>
            <span className="h-4 w-px bg-white/20" />
            <span className="text-sm font-medium tracking-wide">PEACE • EXCELLENCE • SERVICE</span>
          </div>
        </div>
        <Image
          src="/images/pnc_bg.png"
          alt="Pamantasan ng Cabuyao Campus"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right side: Login form */}
      <div className="flex w-full flex-col items-center justify-center bg-background p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8">
               <Image 
                src="/images/logo.png" 
                alt="PNC Logo" 
                width={120} 
                height={120}
                className="rounded-full shadow-lg"
              />
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary">University of Cabuyao</h2>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">PAMANTASAN NG CABUYAO</p>
            </div>
            <Badge className="bg-[#e2f1e9] text-primary hover:bg-[#e2f1e9] font-bold text-sm py-2 px-10 rounded-md mb-8">
              STUDENT / FACULTY / ADMIN LOGIN
            </Badge>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  type="email"
                  placeholder="Student ID / Email"
                  className="h-14 pl-12 bg-blue-50/30 border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="h-14 pl-12 pr-12 bg-blue-50/30 border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" className="text-sm font-bold text-accent hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button 
              type="submit" 
              className="h-14 w-full rounded-full bg-primary text-lg font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "LOGIN"}
            </Button>
          </form>

          <div className="mt-12 rounded-2xl bg-muted/30 p-6 border border-dashed border-primary/20">
            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-primary/60">
              <Info className="h-3 w-3" /> Quick Demo Access
            </div>
            <div className="grid grid-cols-1 gap-2">
               <Button variant="outline" size="sm" className="justify-start font-normal text-xs h-9 hover:bg-primary/5 hover:text-primary border-primary/10" onClick={() => fillDemo('admin@ccs.edu.ph')}>
                 Admin: <span className="ml-1 font-bold">admin@ccs.edu.ph</span>
               </Button>
               <Button variant="outline" size="sm" className="justify-start font-normal text-xs h-9 hover:bg-primary/5 hover:text-primary border-primary/10" onClick={() => fillDemo('faculty@ccs.edu.ph')}>
                 Faculty: <span className="ml-1 font-bold">faculty@ccs.edu.ph</span>
               </Button>
               <Button variant="outline" size="sm" className="justify-start font-normal text-xs h-9 hover:bg-primary/5 hover:text-primary border-primary/10" onClick={() => fillDemo('student@ccs.edu.ph')}>
                 Student: <span className="ml-1 font-bold">student@ccs.edu.ph</span>
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
