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
import { Loader2, Plus, Search, BookText } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { addDoc, collection, orderBy, query } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function LessonsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const lessonsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "lessons"), orderBy("title", "asc"))
  }, [db])

  const { data: lessonItems, loading, error } = useCollection(lessonsQuery)

  const filteredItems = useMemo(() => {
    if (!lessonItems) return []
    const q = searchTerm.toLowerCase().trim()

    return lessonItems.filter((item: any) => {
      const title = String(item.title || "").toLowerCase()
      const courseCode = String(item.courseCode || "").toLowerCase()
      const topic = String(item.topic || "").toLowerCase()
      const content = String(item.content || "").toLowerCase()

      return !q || title.includes(q) || courseCode.includes(q) || topic.includes(q) || content.includes(q)
    })
  }, [lessonItems, searchTerm])

  const handleAddLesson = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const newLesson = {
      title: formData.get("title") as string,
      courseCode: formData.get("courseCode") as string,
      topic: formData.get("topic") as string,
      content: formData.get("content") as string,
      ownerId: user?.uid || null,
      updatedAt: new Date().toISOString(),
    }

    const lessonsRef = collection(db, "lessons")
    addDoc(lessonsRef, newLesson)
      .then(() => {
        setIsDialogOpen(false)
        toast({ title: "Added", description: "Lesson entry created successfully." })
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: lessonsRef.path,
          operation: "create",
          requestResourceData: newLesson,
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
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Lessons</h1>
                <p className="text-muted-foreground">Create and browse lesson plans across course offerings.</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={!user}>
                    <Plus className="h-4 w-4" />
                    Add Lesson
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <form onSubmit={handleAddLesson}>
                    <DialogHeader>
                      <DialogTitle>Add Lesson</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="Lesson 1: Variables and Data Types" required />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="courseCode">Course Code</Label>
                          <Input id="courseCode" name="courseCode" placeholder="CS101" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="topic">Topic</Label>
                          <Input id="topic" name="topic" placeholder="Python Basics" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="content">Content Summary</Label>
                        <Input id="content" name="content" placeholder="Learning goals, activities, and assessments" />
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
                placeholder="Search by title, topic, course code, or content..."
              />
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Failed to load lesson records.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredItems.map((item: any) => (
                  <Card key={item.id} className="border-none shadow-sm ring-1 ring-border">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-primary">{item.title || "Untitled Lesson"}</CardTitle>
                          <CardDescription>{item.topic || "No topic"}</CardDescription>
                        </div>
                        <BookText className="h-5 w-5 text-primary/70" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant="secondary">{item.courseCode || "N/A"}</Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.content || "No content summary"}</p>
                    </CardContent>
                  </Card>
                ))}
                {filteredItems.length === 0 && (
                  <div className="col-span-full py-16 text-center text-muted-foreground italic">
                    No lesson entries found.
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
