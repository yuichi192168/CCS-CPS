"use client"

import { useMemo, useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, BookOpen, User, Calendar, ExternalLink, Download, Plus, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, addDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function ResearchPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const researchQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "research"), orderBy("year", "desc"))
  }, [db])

  const { data: papers, loading, error } = useCollection(researchQuery)

  const handleAddResearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newPaper = {
      title: formData.get("title") as string,
      authors: formData.get("authors") as string,
      year: formData.get("year") as string,
      tags: (formData.get("tags") as string).split(",").map(t => t.trim()),
      citation: 0,
      abstract: formData.get("abstract") as string,
    }

    const researchRef = collection(db, "research")
    addDoc(researchRef, newPaper)
      .then(() => {
        setIsDialogOpen(false)
        toast({ title: "Success", description: "Research paper added to repository." })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: researchRef.path,
          operation: "create",
          requestResourceData: newPaper,
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
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Research Repository</h1>
                <p className="text-muted-foreground">Centralized database of college publications and journals.</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={!user}>
                    <Plus className="h-4 w-4" />
                    Submit New Research
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <form onSubmit={handleAddResearch}>
                    <DialogHeader>
                      <DialogTitle>Submit Research Paper</DialogTitle>
                    </DialogHeader>
                    <div className="grid max-h-[65vh] gap-4 overflow-y-auto py-4 pr-1">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="Paper Title" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="authors">Authors (comma separated)</Label>
                        <Input id="authors" name="authors" placeholder="Author Name, Another Author" required />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="year">Year</Label>
                          <Input id="year" name="year" type="number" defaultValue={new Date().getFullYear()} required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tags">Tags (comma separated)</Label>
                          <Input id="tags" name="tags" placeholder="AI, Quantum, etc." />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="abstract">Abstract</Label>
                        <Input id="abstract" name="abstract" placeholder="Brief summary..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Submit Paper</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title, author, or keyword..." className="pl-9 h-11" />
              </div>
              <Button variant="outline" className="h-11 gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filtering
              </Button>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-destructive">
                Failed to load research repository.
              </div>
            ) : (
              <div className="grid gap-4">
                {papers?.map((paper: any) => (
                  <Card key={paper.id} className="shadow-sm border-none ring-1 ring-border hover:ring-accent transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="font-headline text-xl font-semibold leading-tight text-primary hover:underline cursor-pointer">
                            {paper.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {paper.authors}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {paper.year}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {paper.tags?.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="pt-4 border-t flex items-center justify-between">
                         <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cited by {paper.citation || 0} papers</span>
                         <Button variant="link" size="sm" className="h-auto p-0 text-accent">Read Full Abstract →</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!papers || papers.length === 0) && (
                  <div className="py-20 text-center text-muted-foreground italic">
                    No research records found.
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
