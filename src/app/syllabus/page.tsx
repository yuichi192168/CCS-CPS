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
import { Loader2, Plus, Search, BookOpen, Pencil, Trash2 } from "lucide-react"
import { useCollection, useFirestore, useUserProfile } from "@/firebase"
import { addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function SyllabusPage() {
  const db = useFirestore()
  const { user, profile } = useUserProfile()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  const syllabusQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "syllabus"), orderBy("title", "asc"))
  }, [db])

  const { data: syllabusItems, loading, error } = useCollection(syllabusQuery)
  const canManage = Boolean(user && (profile?.role === "admin" || profile?.role === "faculty"))

  const filteredItems = useMemo(() => {
    if (!syllabusItems) return []
    const q = searchTerm.toLowerCase().trim()

    return syllabusItems.filter((item: any) => {
      const title = String(item.title || "").toLowerCase()
      const courseCode = String(item.courseCode || "").toLowerCase()
      const description = String(item.description || "").toLowerCase()

      return !q || title.includes(q) || courseCode.includes(q) || description.includes(q)
    })
  }, [syllabusItems, searchTerm])

  const handleAddSyllabus = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const newSyllabus = {
      title: formData.get("title") as string,
      courseCode: formData.get("courseCode") as string,
      description: formData.get("description") as string,
      ownerId: user?.uid || null,
      updatedAt: new Date().toISOString(),
    }

    const syllabusRef = collection(db, "syllabus")
    addDoc(syllabusRef, newSyllabus)
      .then(() => {
        setIsDialogOpen(false)
        toast({ title: "Added", description: "Syllabus entry created successfully." })
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: syllabusRef.path,
          operation: "create",
          requestResourceData: newSyllabus,
        })
        errorEmitter.emit("permission-error", permissionError)
      })
  }

  const handleOpenEdit = (item: any) => {
    setSelectedItem(item)
    setIsEditDialogOpen(true)
  }

  const handleUpdateSyllabus = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!db || !selectedItem) return

    const docId = selectedItem.docId || selectedItem.id
    if (!docId) return

    const formData = new FormData(e.currentTarget)
    const updatedSyllabus = {
      title: formData.get("title") as string,
      courseCode: formData.get("courseCode") as string,
      description: formData.get("description") as string,
      updatedAt: new Date().toISOString(),
    }

    const syllabusDocRef = doc(db, "syllabus", String(docId))
    updateDoc(syllabusDocRef, updatedSyllabus)
      .then(() => {
        setIsEditDialogOpen(false)
        setSelectedItem(null)
        toast({ title: "Updated", description: "Syllabus entry updated successfully." })
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: syllabusDocRef.path,
          operation: "update",
          requestResourceData: updatedSyllabus,
        })
        errorEmitter.emit("permission-error", permissionError)
      })
  }

  const handleDeleteSyllabus = () => {
    if (!db || !deleteTarget) return

    const docId = deleteTarget.docId || deleteTarget.id
    if (!docId) return

    const syllabusDocRef = doc(db, "syllabus", String(docId))
    deleteDoc(syllabusDocRef)
      .then(() => {
        setDeleteTarget(null)
        toast({ title: "Deleted", description: "Syllabus entry deleted successfully." })
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: syllabusDocRef.path,
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
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Syllabus</h1>
                <p className="text-muted-foreground">Manage course syllabus outlines and instructional metadata.</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={!canManage}>
                    <Plus className="h-4 w-4" />
                    Add Syllabus
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <form onSubmit={handleAddSyllabus}>
                    <DialogHeader>
                      <DialogTitle>Add Syllabus</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="Introduction to Programming" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="courseCode">Course Code</Label>
                        <Input id="courseCode" name="courseCode" placeholder="CS101" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" placeholder="Week-by-week coverage and outcomes" />
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
                placeholder="Search by title, course code, or description..."
              />
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Failed to load syllabus records.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredItems.map((item: any) => (
                  <Card key={item.id} className="border-none shadow-sm ring-1 ring-border">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-primary">{item.title || "Untitled"}</CardTitle>
                          <CardDescription>{item.description || "No description"}</CardDescription>
                        </div>
                        <BookOpen className="h-5 w-5 text-primary/70" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="secondary">{item.courseCode || "N/A"}</Badge>
                        <div className="flex items-center gap-2">
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
                    No syllabus entries found.
                  </div>
                )}
              </div>
            )}
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-xl">
              <form onSubmit={handleUpdateSyllabus}>
                <DialogHeader>
                  <DialogTitle>Edit Syllabus</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      name="title"
                      placeholder="Introduction to Programming"
                      defaultValue={selectedItem?.title || ""}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-courseCode">Course Code</Label>
                    <Input
                      id="edit-courseCode"
                      name="courseCode"
                      placeholder="CS101"
                      defaultValue={selectedItem?.courseCode || ""}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      name="description"
                      placeholder="Week-by-week coverage and outcomes"
                      defaultValue={selectedItem?.description || ""}
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
                <AlertDialogTitle>Delete syllabus entry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove the selected syllabus record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSyllabus}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </SidebarInset>
    </>
  )
}
