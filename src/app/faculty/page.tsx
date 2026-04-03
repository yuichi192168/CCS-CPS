"use client"

import { useMemo, useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Search, Loader2, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCollection, useFirestore } from "@/firebase"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import { collection, query, orderBy, addDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useRouter } from "next/navigation"

const CCS_LOGO = "https://i.imgur.com/c2ywZT7.png"

export default function FacultyPage() {
  const db = useFirestore()
  const router = useRouter()
  const { user } = useUserProfile()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const facultyQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "faculty"), orderBy("name", "asc"))
  }, [db])

  const { data: faculty, loading, error } = useCollection(facultyQuery)

  const handleAddFaculty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newFaculty = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      specialization: formData.get("specialization") as string,
      publications: 0,
      email: formData.get("email") as string,
      image: "/images/suit-faculty.png",
    }

    const facultyRef = collection(db, "faculty")
    addDoc(facultyRef, newFaculty)
      .then(() => {
        setIsDialogOpen(false)
        toast({ title: "Success", description: "Faculty member added." })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: facultyRef.path,
          operation: "create",
          requestResourceData: newFaculty,
        })
        errorEmitter.emit("permission-error", permissionError)
      })
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Faculty Profiles</h1>
                <p className="text-muted-foreground">Expert directory and specialization profiles.</p>
              </div>
              <div className="flex gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search faculty..." className="pl-9" />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" disabled={!user}>
                      <Plus className="h-4 w-4" />
                      Add Faculty
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <form onSubmit={handleAddFaculty}>
                      <DialogHeader>
                        <DialogTitle>Add Faculty Member</DialogTitle>
                      </DialogHeader>
                      <div className="grid max-h-[65vh] gap-4 overflow-y-auto py-4 pr-1">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" placeholder="Dr. Alan Turing" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" placeholder="alan.turing@pnc.edu.ph" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role / Rank</Label>
                          <Input id="role" name="role" placeholder="Associate Professor" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input id="specialization" name="specialization" placeholder="Computer Science, AI" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Member</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-destructive">
                Failed to load faculty members.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {faculty?.map((member: any) => (
                  <Card key={member.id} className="overflow-hidden shadow-sm border-none ring-1 ring-border group hover:ring-accent transition-all duration-300">
                    <div className="h-24 bg-primary group-hover:bg-primary/90 transition-colors" />
                    <CardContent className="relative flex flex-col items-center p-6 pt-0">
                      <Avatar className="h-20 w-20 -mt-10 border-4 border-background ring-2 ring-primary/5 shadow-md">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarImage src={CCS_LOGO} alt="Fallback" />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="mt-4 text-center">
                        <h3 className="font-headline font-bold text-lg">{member.name}</h3>
                        <p className="text-sm text-accent font-medium">{member.role}</p>
                        <p className="text-xs text-muted-foreground mt-1">Specialization: {member.specialization}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{member.publications || 0} Publications</Badge>
                        <Badge variant="outline" className="text-[10px]">Active Researcher</Badge>
                      </div>
                      <div className="mt-6 flex w-full gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                          <a href={`mailto:${member.email}`}>
                            <Mail className="h-3 w-3" />
                            Email
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/faculty/profile?id=${member.docId || member.id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!faculty || faculty.length === 0) && (
                  <div className="col-span-full py-20 text-center text-muted-foreground italic">
                    No faculty records found.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
