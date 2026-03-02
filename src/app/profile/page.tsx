
"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import { useFirestore } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, User, Mail, Shield } from "lucide-react"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useUserProfile()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [displayName, setDisplayName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "")
    }
  }, [profile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    const userRef = doc(db, "users", profile.uid)
    
    updateDoc(userRef, { displayName })
      .then(() => {
        toast({ title: "Profile Updated", description: "Your profile information has been saved." })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: "update",
          requestResourceData: { displayName },
        })
        errorEmitter.emit("permission-error", permissionError)
      })
      .finally(() => setSaving(false))
  }

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex flex-col gap-2">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">My Profile</h1>
              <p className="text-muted-foreground">Manage your personal information and account settings.</p>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-border">
              <CardHeader className="flex flex-row items-center gap-6 pb-6 border-b">
                <Avatar className="h-20 w-20 border-4 border-background ring-2 ring-primary/10">
                  <AvatarImage src={profile?.photoURL || `https://picsum.photos/seed/${profile?.uid}/200`} />
                  <AvatarFallback>{profile?.displayName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{profile?.displayName}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span className="capitalize">{profile?.role} Account</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> Full Name
                      </Label>
                      <Input 
                        id="name" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" /> Email Address
                      </Label>
                      <Input 
                        id="email" 
                        value={profile?.email} 
                        disabled 
                        className="bg-muted/50"
                      />
                      <p className="text-[10px] text-muted-foreground">Email address cannot be changed for security reasons.</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Role</p>
                      <p className="text-sm font-semibold capitalize">{profile?.role}</p>
                    </div>
                    <Button type="submit" disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-border bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive text-lg">Account Security</CardTitle>
                <CardDescription>Actions related to your account security and data.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button variant="outline" className="w-fit">Change Password</Button>
                <p className="text-xs text-muted-foreground">Request a password reset link to be sent to your registered email.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
