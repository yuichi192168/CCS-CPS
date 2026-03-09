
"use client"

import { useMemo, useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, MoreHorizontal, Loader2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCollection, useFirestore } from "@/firebase"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import { collection, query, orderBy, setDoc, deleteDoc, doc } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const PNC_LOGO = "https://i.imgur.com/5aAzmh5.png"

export default function StudentsPage() {
  const db = useFirestore()
  const { profile } = useUserProfile()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const isAdmin = profile?.role === 'admin'

  const studentsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "students"), orderBy("name", "asc"))
  }, [db])

  const { data: students, loading, error } = useCollection(studentsQuery)

  const filteredStudents = useMemo(() => {
    if (!students) return []
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [students, searchTerm])

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const studentId = formData.get("studentId") as string
    
    const newStudent = {
      id: studentId,
      name: formData.get("name") as string,
      course: formData.get("course") as string,
      year: formData.get("year") as string,
      status: formData.get("status") as string,
      email: formData.get("email") as string,
      imageUrl: "/images/suit-student.png"
    }

    // Using setDoc with the studentId as the document reference to avoid random UIDs
    const studentRef = doc(db, "students", studentId)
    setDoc(studentRef, newStudent)
      .then(() => {
        setIsDialogOpen(false)
        toast({ title: "Success", description: "Student enrolled successfully." })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: studentRef.path,
          operation: "create",
          requestResourceData: newStudent,
        })
        errorEmitter.emit("permission-error", permissionError)
      })
  }

  const handleDeleteStudent = (studentId: string) => {
    const studentRef = doc(db, "students", studentId)
    deleteDoc(studentRef)
      .then(() => {
        toast({ title: "Deleted", description: "Student record has been removed." })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: studentRef.path,
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
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Student Profiling</h1>
                <p className="text-muted-foreground">Manage and view comprehensive student academic records.</p>
              </div>

              {isAdmin && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto gap-2">
                      <Plus className="h-4 w-4" />
                      Enroll New Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddStudent}>
                      <DialogHeader>
                        <DialogTitle>Enroll Student</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="studentId">Student ID</Label>
                          <Input id="studentId" name="studentId" placeholder="2024-0001" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" placeholder="Juan Dela Cruz" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" name="email" type="email" placeholder="juan@pnc.edu.ph" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="course">Course</Label>
                            <Input id="course" name="course" placeholder="BSCS" required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="year">Year Level</Label>
                            <Input id="year" name="year" placeholder="3rd Year" required />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select name="status" defaultValue="Active">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Graduated">Graduated</SelectItem>
                              <SelectItem value="On Leave">On Leave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Enroll Student</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <Card className="shadow-sm border-none ring-1 ring-border overflow-hidden">
              <CardHeader className="border-b bg-muted/5 pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search students by name, ID..." 
                      className="pl-9 h-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">Export CSV</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-destructive">
                    Failed to load students. Please try again later.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[120px]">Student ID</TableHead>
                        <TableHead>Name & Email</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Year Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student: any) => (
                        <TableRow key={student.id} className="cursor-default hover:bg-muted/20 transition-colors">
                          <TableCell className="font-mono text-xs font-semibold">{student.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-1 ring-border">
                                <AvatarImage src={student.imageUrl} alt={student.name} />
                                <AvatarImage src={PNC_LOGO} alt="Fallback" />
                                <AvatarFallback>{student.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm leading-none">{student.name}</span>
                                <span className="text-[10px] text-muted-foreground mt-1">{student.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{student.course}</TableCell>
                          <TableCell className="text-sm">{student.year}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === "Active" ? "default" : student.status === "Graduated" ? "secondary" : "outline"} className={student.status === "Active" ? "bg-accent text-accent-foreground" : "text-[10px]"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">View Records</DropdownMenuItem>
                                {isAdmin && (
                                  <>
                                    <DropdownMenuItem className="cursor-pointer">Edit Info</DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive cursor-pointer"
                                      onClick={() => handleDeleteStudent(student.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Record
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                            No matching students found in the database.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
