"use client"

import { useMemo, useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Search, Loader2, Plus, Trash2, Pencil, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCollection, useFirestore } from "@/firebase"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import { collection, query, orderBy, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore"
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
  const { user, profile } = useUserProfile()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editFaculty, setEditFaculty] = useState<any | null>(null)

  const facultyQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "faculty"), orderBy("name", "asc"))
  }, [db])

  const { data: faculty, loading, error } = useCollection(facultyQuery)

  const handleAddFaculty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const facultyData = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      specialization: formData.get("specialization") as string,
      publications: editFaculty?.publications || 0,
      email: formData.get("email") as string,
      image: CCS_LOGO,
    }

    if (editFaculty) {
      const facultyDocRef = doc(db, "faculty", editFaculty.docId || editFaculty.id)
      setDoc(facultyDocRef, facultyData, { merge: true })
        .then(() => {
          setIsDialogOpen(false)
          setEditFaculty(null)
          toast({ title: "Success", description: "Faculty member updated." })
        })
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: facultyDocRef.path,
            operation: "update",
            requestResourceData: facultyData,
          })
          errorEmitter.emit("permission-error", permissionError)
        })
      return
    }

    const facultyRef = collection(db, "faculty")
    addDoc(facultyRef, facultyData)
      .then(() => {
        setIsDialogOpen(false)
        setEditFaculty(null)
        toast({ title: "Success", description: "Faculty member added." })
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: facultyRef.path,
          operation: "create",
          requestResourceData: facultyData,
        })
        errorEmitter.emit("permission-error", permissionError)
      })
  }

  const handleDeleteFaculty = (facultyId: string) => {
    if (!db) return
    const facultyRef = doc(db, "faculty", facultyId)

    deleteDoc(facultyRef)
      .then(() => {
        toast({ title: "Deleted", description: "Faculty member has been removed." })
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: facultyRef.path,
          operation: "delete",
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
                <Dialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setEditFaculty(null)
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="gap-2"
                      disabled={!user}
                      onClick={() => setEditFaculty(null)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Faculty
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <form onSubmit={handleAddFaculty}>
                      <DialogHeader>
                        <DialogTitle>{editFaculty ? "Edit Faculty Member" : "Add Faculty Member"}</DialogTitle>
                      </DialogHeader>
                      <div className="grid max-h-[65vh] gap-4 overflow-y-auto py-4 pr-1">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" placeholder="Dr. Alan Turing" required defaultValue={editFaculty?.name || ""} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" placeholder="alan.turing@pnc.edu.ph" required defaultValue={editFaculty?.email || ""} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role / Rank</Label>
                          <Input id="role" name="role" placeholder="Associate Professor" required defaultValue={editFaculty?.role || ""} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input id="specialization" name="specialization" placeholder="Computer Science, AI" required defaultValue={editFaculty?.specialization || ""} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{editFaculty ? "Update Member" : "Add Member"}</Button>
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
                        <AvatarImage src={member.image || CCS_LOGO} alt={member.name} />
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
                      <div className="mt-6 flex w-full items-center justify-center gap-2">
                        <Button variant="outline" size="icon" title="Email" aria-label="Email" asChild>
                          <a href={`mailto:${member.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                        {(profile?.role === "admin") && (
                          <Button
                            variant="outline"
                            size="icon"
                            title="Edit Info"
                            aria-label="Edit Info"
                            onClick={() => {
                              setEditFaculty(member)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {(profile?.role === "admin") && (
                          <Button
                            variant="destructive"
                            size="icon"
                            title="Delete"
                            aria-label="Delete"
                            onClick={() => handleDeleteFaculty(member.docId || member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          title="View Profile"
                          aria-label="View Profile"
                          onClick={() => router.push(`/faculty/profile?id=${member.docId || member.id}`)}
                        >
                          <Eye className="h-4 w-4" />
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
