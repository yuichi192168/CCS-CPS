"use client"

import { useMemo, useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Plus, Search, LibraryBig, Pencil, Trash2 } from "lucide-react"
import { useCollection, useFirestore, useUserProfile } from "@/firebase"
import { addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function CurriculumPage() {
  const db = useFirestore()
  const { user, profile } = useUserProfile()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  const curriculumQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "curriculum"), orderBy("program", "asc"))
  }, [db])

  const { data: curriculumItems, loading, error } = useCollection(curriculumQuery)
  const canManage = Boolean(user && (profile?.role === "admin" || profile?.role === "faculty"))

  const filteredItems = useMemo(() => {
    if (!curriculumItems) return []
    const q = searchTerm.toLowerCase().trim()

    return curriculumItems.filter((item: any) => {
      const program = String(item.program || "").toLowerCase()
      const academicYear = String(item.academicYear || "").toLowerCase()
      const semester = String(item.semester || "").toLowerCase()
      const courses = Array.isArray(item.courses) ? item.courses.join(" ").toLowerCase() : ""

      return !q || program.includes(q) || academicYear.includes(q) || semester.includes(q) || courses.includes(q)
    })
  }, [curriculumItems, searchTerm])

  const handleAddCurriculum = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const newCurriculum = {
      program: formData.get("program") as string,
      academicYear: formData.get("academicYear") as string,
      semester: formData.get("semester") as string,
      courses: String(formData.get("courses") || "")
        .split(",")
        .map((course) => course.trim())
        .filter(Boolean),
      ownerId: user?.uid || null,
      updatedAt: new Date().toISOString(),
    }

    const curriculumRef = collection(db, "curriculum")
    addDoc(curriculumRef, newCurriculum)
      .then(() => {
        setIsDialogOpen(false)
        toast({ title: "Added", description: "Curriculum entry created successfully." })
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: curriculumRef.path,
          operation: "create",
          requestResourceData: newCurriculum,
        })
        errorEmitter.emit("permission-error", permissionError)
      })
  }

  const handleOpenEdit = (item: any) => {
    setSelectedItem(item)
    setIsEditDialogOpen(true)
  }

  const handleUpdateCurriculum = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!db || !selectedItem) return

    const docId = selectedItem.docId || selectedItem.id
    if (!docId) return

    const formData = new FormData(e.currentTarget)
    const updatedCurriculum = {
      program: formData.get("program") as string,
      academicYear: formData.get("academicYear") as string,
      semester: formData.get("semester") as string,
      courses: String(formData.get("courses") || "")
        .split(",")
        .map((course) => course.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    }

    const curriculumDocRef = doc(db, "curriculum", String(docId))
    updateDoc(curriculumDocRef, updatedCurriculum)
      .then(() => {
        setIsEditDialogOpen(false)
        setSelectedItem(null)
        toast({ title: "Updated", description: "Curriculum entry updated successfully." })
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: curriculumDocRef.path,
          operation: "update",
          requestResourceData: updatedCurriculum,
        })
        errorEmitter.emit("permission-error", permissionError)
      })
  }

  const handleDeleteCurriculum = () => {
    if (!db || !deleteTarget) return

    const docId = deleteTarget.docId || deleteTarget.id
    if (!docId) return

    const curriculumDocRef = doc(db, "curriculum", String(docId))
    deleteDoc(curriculumDocRef)
      .then(() => {
        setDeleteTarget(null)
        toast({ title: "Deleted", description: "Curriculum entry deleted successfully." })
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: curriculumDocRef.path,
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
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Curriculum</h1>
                <p className="text-muted-foreground">Organize program structures and semester course bundles.</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={!canManage}>
                    <Plus className="h-4 w-4" />
                    Add Curriculum
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <form onSubmit={handleAddCurriculum}>
                    <DialogHeader>
                      <DialogTitle>Add Curriculum</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="program">Program</Label>
                        <Input id="program" name="program" placeholder="BS Computer Science" required />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="academicYear">Academic Year</Label>
                          <Input id="academicYear" name="academicYear" placeholder="2026-2027" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="semester">Semester</Label>
                          <Input id="semester" name="semester" placeholder="1st Semester" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="courses">Courses (comma separated)</Label>
                        <Input id="courses" name="courses" placeholder="CS101, MATH01, NSTP1" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative max-w-xl">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                placeholder="Search by program, year, semester, or course..."
              />
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Failed to load curriculum records.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredItems.map((item: any) => (
                  <Card key={item.id} className="border-none shadow-sm ring-1 ring-border">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-primary">{item.program || "Untitled Program"}</CardTitle>
                          <CardDescription>{item.academicYear || "N/A"} {item.semester ? `- ${item.semester}` : ""}</CardDescription>
                        </div>
                        <LibraryBig className="h-5 w-5 text-primary/70" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {(item.courses || []).slice(0, 6).map((course: string) => (
                            <Badge key={course} variant="secondary">{course}</Badge>
                          ))}
                          {Array.isArray(item.courses) && item.courses.length > 6 && (
                            <Badge variant="outline">+{item.courses.length - 6} more</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)} disabled={!canManage}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                            disabled={!canManage}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredItems.length === 0 && (
                  <div className="col-span-full py-16 text-center text-muted-foreground italic">
                    No curriculum entries found.
                  </div>
                )}
              </div>
            )}
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-xl">
              <form onSubmit={handleUpdateCurriculum}>
                <DialogHeader>
                  <DialogTitle>Edit Curriculum</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-program">Program</Label>
                    <Input
                      id="edit-program"
                      name="program"
                      placeholder="BS Computer Science"
                      defaultValue={selectedItem?.program || ""}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-academicYear">Academic Year</Label>
                      <Input
                        id="edit-academicYear"
                        name="academicYear"
                        placeholder="2026-2027"
                        defaultValue={selectedItem?.academicYear || ""}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-semester">Semester</Label>
                      <Input
                        id="edit-semester"
                        name="semester"
                        placeholder="1st Semester"
                        defaultValue={selectedItem?.semester || ""}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-courses">Courses (comma separated)</Label>
                    <Input
                      id="edit-courses"
                      name="courses"
                      placeholder="CS101, MATH01, NSTP1"
                      defaultValue={Array.isArray(selectedItem?.courses) ? selectedItem.courses.join(", ") : ""}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Update</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete curriculum entry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove the selected curriculum record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCurriculum}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </SidebarInset>
    </>
  )
}
